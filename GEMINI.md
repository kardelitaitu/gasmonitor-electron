# Project Overview: Electron UI ETH Gas Tracker

This project is an Electron-based desktop application designed to function as a UI for an Ethereum (ETH) gas tracker. It leverages modern web technologies to provide a cross-platform user interface.

## Technologies Used

*   **Electron:** For building cross-platform desktop applications with web technologies.
*   **Electron Forge:** A complete tool for building modern Electron applications, handling packaging, and distribution.
*   **Vite:** A fast build tool that provides a lightning-fast development experience for web projects.
*   **TypeScript:** A superset of JavaScript that adds static typing, enhancing code quality and maintainability.
*   **HTML/CSS:** For structuring and styling the user interface.
*   **ESLint:** For maintaining code quality and consistency.

## Architecture

The application follows the standard Electron main and renderer process architecture:

*   **Main Process (`src/main.ts`):** Manages the application window lifecycle, handles system events, and facilitates inter-process communication (IPC) with the renderer process. It includes logic for saving and restoring window state (size and position) and handling window controls (minimize, maximize, close, resize).
*   **Renderer Process (`src/renderer.ts`):** Built with web technologies (HTML, CSS, TypeScript), this process renders the user interface. It communicates with the main process via a `window.api` object to perform desktop-specific actions like window control and resizing.
*   **Vite Configuration:** The project uses Vite for both the main and renderer processes, enabling efficient development and bundling.

## Building and Running

To get started with the project, use the following commands:

*   **`npm install`**: Install all project dependencies.
*   **`npm start`**: Starts the development server and runs the Electron application in development mode.
*   **`npm run package`**: Packages the application into a distributable format for the current platform.
*   **`npm run make`**: Creates installers for various platforms.
*   **`npm run publish`**: Publishes the application (requires further configuration).
*   **`npm run lint`**: Runs ESLint to check for code quality and style issues.

## Development Conventions

*   **TypeScript:** The project is written in TypeScript, promoting type safety and better code organization.
*   **ESLint:** Code adheres to ESLint rules for consistent code style and to catch potential errors early. The configuration is defined in `.eslintrc.json`.
*   **Window State Management:** The application saves and loads window size and position to `window-state.json` in the user data directory, providing a consistent user experience across sessions.
*   **Custom Title Bar:** The application implements a custom title bar with its own minimize, maximize, and close buttons, along with a custom resizing mechanism.
