#!/usr/bin/env node

import fs from 'fs/promises';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from 'zod-to-json-schema';
import z from 'zod';
import { readFile, utils, read, writeFile } from 'xlsx';
import { getArgs, validatePath, checkDirectory, allowedDirectories } from "./src/utils";
import { excelOptions } from './src/const';
import {
  ReadFileArgsSchema,
  WriteFileArgsSchema,
  ListDirectoryArgsSchema,
  ReadExcelFileArgsSchema,
  WriteExcelFileArgsSchema,
} from './src/const/schema';

// Command line argument parsing
const args = getArgs();
if (args.length === 0) {
  process.exit(1);
} else {
  checkDirectory(args);
}

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

const server = new Server(
  {
    name: "mcp-excel-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      // prompts: {},
      // resources: {},
    },
  }
);

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'read_file_content',
        description: 'read file content',
        inputSchema: zodToJsonSchema(ReadFileArgsSchema) as ToolInput,
        required: ['path'],
      },
      {
        name: 'write_file_content',
        description: 'write file content',
        inputSchema: zodToJsonSchema(WriteFileArgsSchema) as ToolInput,
        required: ['path', 'content'],
      },
      {
        name: "list_directory",
        description: "list directory",
        inputSchema: zodToJsonSchema(ListDirectoryArgsSchema) as ToolInput,
        required: ["path"],
      },
      {
        name: "get_excel_content",
        description: "read excel file content",
        inputSchema: zodToJsonSchema(ReadExcelFileArgsSchema) as ToolInput,
        required: ["path"],
      },
      {
        name: 'get_online_excel_content',
        description: 'get online excel content',
        inputSchema: zodToJsonSchema(ReadFileArgsSchema) as ToolInput,
        required: ['path'],
      },
      {
        name: 'write_excel_content',
        description: 'write excel content',
        inputSchema: zodToJsonSchema(WriteExcelFileArgsSchema) as ToolInput,
        required: ['path', 'content'],
      },
    ],
    prompts: [],
    resources: [],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const {name, arguments: args} = request.params;

    switch (name) {
      case 'read_file_content': {
        const parsed = ReadFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for read_file_content: ${parsed.error}`);
        }

        const validPath = await validatePath(parsed.data.path);
        const content = await fs.readFile(validPath, 'utf-8');

        return {
          content: [{type: 'text', text: content}],
        };
      }

      case 'write_file_content': {
        const parsed = WriteFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for write_file_content: ${parsed.error}`);
        }

        const validPath = await validatePath(parsed.data.path);
        await fs.writeFile(validPath, parsed.data.content, 'utf-8');

        return {
          content: [{type: 'text', text: `Successfully wrote to ${parsed.data.path}`}],
        };
      }

      case 'list_directory': {
        const parsed = ListDirectoryArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for list_directory: ${parsed.error}`);
        }

        const validPath = await validatePath(parsed.data.path);
        const entries = await fs.readdir(validPath, {withFileTypes: true});
        const formatted = entries
          .map((entry) => `${entry.isDirectory() ? '[DIR]' : '[FILE]'} ${entry.name}`)
          .join('\n');

        return {
          content: [{type: "text", text: formatted}],
        };
      }

      case 'get_excel_content': {
        const parsed = ReadExcelFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for get_excel_content: ${parsed.error}`);
        }

        const validPath = await validatePath(parsed.data.path)
        const wb = readFile(validPath, excelOptions);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = utils.sheet_to_json(ws);

        return {
          content: [{type: "text", text: JSON.stringify(data)}],
        };
      }

      case 'get_online_excel_content': {
        const parsed = ReadFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for get_online_excel_content: ${parsed.error}`);
        }

        const file = await (await fetch(parsed.data.path)).arrayBuffer();
        const wb = read(file);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = utils.sheet_to_json(ws);

        return {
          content: [{type: "text", text: JSON.stringify(data)}],
        };
      }

      case 'write_excel_content': {
        const parsed = WriteExcelFileArgsSchema.safeParse(args);
        if (!parsed.success) {
          throw new Error(`Invalid arguments for write_excel_content: ${parsed.error}`);
        }

        const validPath = await validatePath(parsed.data.path);
        const jsonData = parsed.data.content; // 你应该从 args 中获取 JSON 数组数据

        try {
          const excelData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

          const worksheet = utils.json_to_sheet(excelData);
          const workbook = utils.book_new();
          utils.book_append_sheet(workbook, worksheet, 'Sheet1');

          writeFile(workbook, validPath, { compression: true });

          return {
            content: [{ type: 'text', text: `Successfully wrote to ${parsed.data.path}` }],
          };
        } catch (err) {
          console.log(err)
          return {
            // @ts-ignore
            content: [{ type: 'text', text: `Error: ${err.message}` }],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      content: [{type: 'text', text: `Error: ${errorMessage}`}],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Excel MCP Server running on stdio');
  console.error('Allowed directories:', allowedDirectories);
}

runServer().catch((error) => {
  console.error('Fatal error in runServer:', error);
  process.exit(1);
});
