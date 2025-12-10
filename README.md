# PDF Namer

**PDF Namer** is an intelligent desktop application that automates the process of renaming PDF files. By leveraging Google's **Gemini AI**, it analyzes the content of your PDFs (specifically the first page) and suggests concise, descriptive filenames.

Built with **Electron**, **React**, and **TypeScript**, it provides a modern, seamless experience for organizing your documents.

## Features

*   **Drag & Drop Interface**: Easily process multiple PDF files at once by dragging them into the application window.
*   **AI-Powered Suggestions**: Extracts the first page of each PDF and uses the **Gemini 1.5 Flash** model to generate context-aware filenames (e.g., detecting dates, company names, and document types).
*   **Review System**:
    *   **Review**: See the original name and the AI's suggestion side-by-side.
    *   **Edit**: Manually tweak the suggested name if needed.
    *   **Approve**: Apply the rename with a single click.
    *   **Reject**: Discard the suggestion and keep the original file.
*   **Secure API Key Management**: Your Gemini API key is stored locally on your device using `electron-store`.
*   **Cross-Platform**: Designed for macOS, Windows, and Linux.

## Screenshots

*(Screenshots to be added)*

## Installation

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn
*   A **Google Gemini API Key** (Get one [here](https://aistudio.google.com/app/apikey))

### Development

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/pdf-namer.git
    cd pdf-namer
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the application in development mode:
    ```bash
    npm start
    ```

## Usage

1.  **Launch the App**: Open PDF Namer.
2.  **Configure API Key**: On the first launch, you will be prompted to enter your Gemini API Key. This is stored securely on your local machine. You can update it anytime via the Settings (gear icon).
3.  **Drop Files**: Drag and drop one or more PDF files into the main area.
4.  **Wait for Analysis**: The app will extract the first page and send it to Gemini for analysis.
5.  **Review & Rename**:
    *   Review the `Proposed Name`.
    *   Click the **Check (✓)** button to approve and rename the file.
    *   Click the **Cross (✗)** button to ignore.
    *   Click the **Retry** button if analysis fails.

## Building for Production

To create a distributable installer for your operating system:

```bash
npm run package
```

The output will be available in the `release/build` directory.

## Tech Stack

*   [Electron](https://www.electronjs.org/)
*   [React](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai)
*   [pdf-lib](https://pdf-lib.js.org/) (for PDF manipulation)
*   [electron-store](https://github.com/sindresorhus/electron-store) (for local persistence)

## License

MIT