import z from 'zod';

// Schema definitions
export const ReadFileArgsSchema = z.object({
  path: z.string(),
});

export const WriteFileArgsSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const ListDirectoryArgsSchema = z.object({
  path: z.string(),
});

export const ReadExcelFileArgsSchema = z.object({
  path: z.string(),
});
