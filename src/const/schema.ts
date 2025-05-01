import z from 'zod';

const Primitive = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.undefined(),
]);

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

export const WriteExcelFileArgsSchema = z.object({
  path: z.string(),
  content: z.string().or(z.array(z.record(Primitive))),
});
