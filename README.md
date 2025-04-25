# mcp-excel-server

Node.js server implementing Model Context Protocol (MCP) for excel file operations.

## Features

- Read files
- list directories
- Search files
- Read Excel

**Note**: The server will only allow operations within directories specified via `args`.

## 🔧 Install

### NPM Installation

```shell
npm install @qianO33/mcp-excel-server
```

## 📚 API Reference

### Resources
- The primary filesystem operations interface `file://system`

### Tool Functions

#### 📖 Reading Operations

- **read_file_content**
  - Reads the complete contents of a file
  - Input: `path` (string)
  - Uses UTF-8 encoding for text files

#### 📁 Directory Operations

- **list_directory**
  - Lists directory contents with type indicators
  - Input: `path` (string)
  - Returns entries with [FILE] or [DIR] prefixes

#### 🔍 Reading Excel and Information

- **get_excel_content**
  - Reads the Excel contents of a file
  - Input: `path` (string)
  - Uses UTF-8 encoding for excel file

## 🔧 Usage Guide

### Integration with Claude Desktop
Add the following configuration to your : `claude_desktop_config.json`

> Note: You can sandbox directories by mounting them to . Adding the `ro` flag makes directories read-only. `/projects`

#### NPX Method

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@qianO33/mcp-excel-server",
        "/Users/username/Desktop",
        "/path/to/other/allowed/dir"
      ]
    }
  }
}
```

## Usage with VS Code

For quick installation, click the installation buttons below...

[![Install with NPX in VS Code](https://img.shields.io/badge/VS_Code-NPM-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=filesystem&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40modelcontextprotocol%2Fserver-filesystem%22%2C%22%24%7BworkspaceFolder%7D%22%5D%7D) [![Install with NPX in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-NPM-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=filesystem&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40modelcontextprotocol%2Fserver-filesystem%22%2C%22%24%7BworkspaceFolder%7D%22%5D%7D&quality=insiders)

[![Install with Docker in VS Code](https://img.shields.io/badge/VS_Code-Docker-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=filesystem&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22--mount%22%2C%22type%3Dbind%2Csrc%3D%24%7BworkspaceFolder%7D%2Cdst%3D%2Fprojects%2Fworkspace%22%2C%22mcp%2Ffilesystem%22%2C%22%2Fprojects%22%5D%7D) [![Install with Docker in VS Code Insiders](https://img.shields.io/badge/VS_Code_Insiders-Docker-24bfa5?style=flat-square&logo=visualstudiocode&logoColor=white)](https://insiders.vscode.dev/redirect/mcp/install?name=filesystem&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22--mount%22%2C%22type%3Dbind%2Csrc%3D%24%7BworkspaceFolder%7D%2Cdst%3D%2Fprojects%2Fworkspace%22%2C%22mcp%2Ffilesystem%22%2C%22%2Fprojects%22%5D%7D&quality=insiders)

For manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open Settings (JSON)`.

Optionally, you can add it to a file called `.vscode/mcp.json` in your workspace. This will allow you to share the configuration with others.

> Note that the `mcp` key is not needed in the `.vscode/mcp.json` file.

You can provide sandboxed directories to the server by mounting them to `/projects`. Adding the `ro` flag will make the directory readonly by the server.

### NPX

```json
{
  "mcp": {
    "servers": {
      "filesystem": {
        "command": "npx",
        "args": [
          "-y",
          "@qianO33/mcp-excel-server",
          "${workspaceFolder}"
        ]
      }
    }
  }
}
```

## 🤝 Contributing
Contributions are welcome! To contribute:
1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Submit a pull request

Please ensure your code adheres to the project's coding standards and includes appropriate tests.

## 📜 License
This MCP server is licensed under the MIT License. You are free to use, modify, and distribute the software, subject to the MIT License terms and conditions. See the LICENSE file in the repository for details.






