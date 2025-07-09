# Code Editor with Node.js Terminal

A modern web-based code editor with an integrated Node.js terminal for running JavaScript files.

## Features

- **Multi-language Support**: HTML, CSS, JavaScript, TypeScript, Python, C++, Java, and more
- **Integrated Node.js Terminal**: Run JavaScript files directly in the browser
- **Live Preview**: See HTML/CSS/JS changes in real-time
- **Code Formatting**: Automatic code formatting for JavaScript and TypeScript
- **File Management**: Create, rename, and delete files
- **Code Snippets**: Built-in and custom code snippets
- **Dark/Light Theme**: Toggle between themes
- **Keyboard Shortcuts**: Quick access to common actions

## Node.js Terminal Usage

The integrated terminal allows you to run JavaScript files using Node.js:

### Available Commands

- `node filename.js` - Run a JavaScript file
- `ls` - List all files in the editor
- `clear` - Clear the terminal
- `help` - Show available commands

### Example

1. Create or edit a JavaScript file (e.g., `script.js`)
2. Add some code:
   ```javascript
   console.log("Hello from Node.js!");
   console.log("Current time:", new Date().toLocaleString());
   
   const a = 5;
   const b = 3;
   console.log(`${a} + ${b} = ${a + b}`);
   ```

3. Click the "Show Terminal" button (bottom-right corner)
4. Type `node script.js` and press Enter
5. See the output in the terminal!

### Terminal Features

- **Colored Output**: Different colors for different log levels
- **Error Handling**: Clear error messages for syntax errors
- **File Listing**: See all your files with the `ls` command
- **Interactive**: Full terminal experience with command history

## Getting Started

1. Clone or download the project
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser and start coding!

## Keyboard Shortcuts

- `Ctrl+Enter` - Run code
- `Ctrl+Shift+F` - Format code
- `Ctrl+Shift+P` - Open command palette
- `Ctrl+S` - Save (demo)
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo

## Technologies Used

- React with TypeScript
- Monaco Editor (VS Code's editor)
- Xterm.js (Terminal emulator)
- Tailwind CSS
- Vite

## License

MIT License 