import React from 'react';
import { FileText, Check, X, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileStatus = 'analyzing' | 'review' | 'completed' | 'error';

export interface FileItemProps {
  id: string;
  originalName: string;
  proposedName?: string;
  status: FileStatus;
  errorMessage?: string;
  onApprove: (id: string, name: string) => void;
  onReject: (id: string) => void;
  onRetry: (id: string) => void;
}

export function FileItemCard({
  id,
  originalName,
  proposedName,
  status,
  errorMessage,
  onApprove,
  onReject,
  onRetry,
}: FileItemProps) {
  const [editedName, setEditedName] = React.useState(proposedName || '');

  React.useEffect(() => {
    if (proposedName) {
      setEditedName(proposedName);
    }
  }, [proposedName]);

  return (
    <div className={cn(
        'group relative flex items-start gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
      status === 'review' && "border-primary/50 shadow-md ring-1 ring-primary/20",
      status === 'completed' && "bg-muted/30 border-muted",
      status === 'error' && "border-destructive/50 bg-destructive/5"
    )}>
      {/* Icon Section */}
      <div className="flex-shrink-0 mt-1">
        {status === 'analyzing' ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : status === 'completed' ? (
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        ) : status === 'error' ? (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <X className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-grow min-w-0 space-y-1">
        {/* Original Filename */}
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="truncate max-w-[300px]" title={originalName}>
            {originalName}
          </span>
          {status === 'review' && <ArrowRight className="w-3 h-3 mx-2 flex-shrink-0" />}
        </div>

        {/* Status-dependent Content */}
        <div className="min-h-[28px] flex items-center">
          {status === 'analyzing' && (
            <span className="text-sm font-medium animate-pulse">Analyzing content...</span>
          )}

          {status === 'error' && (
             <div className="flex items-center justify-between w-full">
               <span className="text-sm text-destructive font-medium">{errorMessage || 'Analysis failed'}</span>
               <button
                 onClick={() => onRetry(id)}
                 className="ml-2 p-1.5 rounded-full hover:bg-destructive/10 transition-colors text-destructive"
                 title="Retry"
               >
                 <RefreshCw className="w-4 h-4" />
               </button>
             </div>
          )}

          {status === 'completed' && (
            <span className="text-sm font-semibold text-foreground truncate" title={proposedName}>
              {proposedName}
            </span>
          )}

          {status === 'review' && (
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="flex-grow h-8 px-2 rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onReject(id)}
                  className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onApprove(id, editedName)}
                  className="p-1.5 rounded-md text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
