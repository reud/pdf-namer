import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { FileList, FileData } from './components/FileList';
import { SettingsDialog } from './components/SettingsDialog';
import { ProcessingFile } from '../shared/types';
import './App.css';

// Electron adds a 'path' property to File objects
// interface ElectronFile extends File {
//   path: string;
// }

function Main() {
  const [files, setFiles] = useState<ProcessingFile[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  // Initial Check for API Key
  useEffect(() => {
    const checkApiKey = async () => {
      const response = await window.electron.settings.getApiKey();
      if (response.success && response.key) {
        setApiKey(response.key);
      } else {
        setIsSettingsOpen(true);
      }
    };
    checkApiKey();
  }, []);

  const processFile = async (file: ProcessingFile) => {
    try {
      const response = await window.electron.gemini.proposeName({
        filePath: file.path,
        originalName: file.originalName,
      });

      setFiles(prev => prev.map(f => {
        if (f.id === file.id) {
          if (response.success && response.proposedName) {
            return {
              ...f,
              status: 'review',
              proposedName: response.proposedName,
            };
          } else {
            return {
              ...f,
              status: 'error',
              errorMessage: response.error || 'Failed to generate name',
            };
          }
        }
        return f;
      }));
    } catch (error) {
      setFiles(prev => prev.map(f => {
        if (f.id === file.id) {
            return {
                ...f,
                status: 'error',
                errorMessage: (error as Error).message || 'Unknown error occurred',
            };
        }
        return f;
      }));
    }
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles: ProcessingFile[] = selectedFiles.map(f => ({
      id: crypto.randomUUID(),
      originalName: f.name,
      path: window.electron.file.getPath(f),
      status: 'analyzing',
    }));
    
    setFiles(prev => [...prev, ...newFiles]);

    // Start processing
    newFiles.forEach(processFile);
  };

  const handleApprove = async (id: string, name: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;

    try {
      const response = await window.electron.file.rename({
        filePath: file.path,
        newFileName: name,
      });

      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          if (response.success) {
            return {
               ...f,
               status: 'completed',
               proposedName: name, // Ensure displayed name matches final name
               path: response.newPath || f.path // Update path if returned, though likely not needed for display
            };
          } else {
            return {
              ...f,
              status: 'error',
              errorMessage: response.error || 'Rename failed',
            };
          }
        }
        return f;
      }));
    } catch (error) {
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            status: 'error',
            errorMessage: (error as Error).message,
          };
        }
        return f;
      }));
    }
  };

  const handleReject = (id: string) => {
     setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRetry = (id: string) => {
     const file = files.find(f => f.id === id);
     if (!file) return;

     // Reset status to analyzing
     setFiles(prev => prev.map(f => {
       if (f.id === id) return { ...f, status: 'analyzing', errorMessage: undefined };
       return f;
     }));

     // Retry processing
     processFile(file);
  };

  const handleSaveApiKey = async (key: string) => {
    const response = await window.electron.settings.saveApiKey(key);
    if (response.success) {
        setApiKey(key);
        setIsSettingsOpen(false);
    } else {
        // Optional: Show error toast/alert
        console.error("Failed to save API key");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
             AI
           </div>
           <h1 className="text-xl font-bold tracking-tight">PDF Namer</h1>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto pb-20">
           <div className="mb-10 text-center space-y-3">
             <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
               Smart Rename
             </h2>
             <p className="text-muted-foreground text-lg max-w-lg mx-auto">
               Drop your PDFs below. Gemini AI will analyze their content and suggest better filenames.
             </p>
           </div>
           
           <FileUploader onFilesSelected={handleFilesSelected} />
           
           <FileList
             files={files}
             onApprove={handleApprove}
             onReject={handleReject}
             onRetry={handleRetry}
           />
        </div>
      </main>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        initialApiKey={apiKey}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
