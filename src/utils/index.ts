import path from 'path'
import os from 'os'
import fs from 'fs/promises';

/**
 * 将包含波浪号（`~`）的文件路径展开为用户的主目录。
 *
 * 此函数将文件路径开头的波浪号替换为当前用户主目录的绝对路径。
 * 如果文件路径不是以 `~` 开头或不完全等于 `~`，则返回未修改的文件路径。
 *
 * @param {string} filepath - 要处理的文件路径。可以包含 `~` 作为主目录的简写。
 * @returns {string} 展开后的文件路径，`~` 被替换为主目录，如果没有波浪号则返回原始路径。
 */
export const expandHome = (filepath: string): string => {
  if (filepath.startsWith('~/') || filepath === '~') {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

export const getArgs = () => {
  try {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      throw Error('Usage: mcp-excel-server <allowed-directory> [additional-directories...]');
    }

    return args;
  } catch (err) {
    console.error("Usage: mcp-excel-server <allowed-directory> [additional-directories...]");
    process.exit(1);
  }
};

export const checkDirectory = async (args: string[]) => {
  await Promise.all(args.map(async (dir) => {
    try {
      const stats = await fs.stat(expandHome(dir));
      if (!stats.isDirectory()) {
        console.error(`Error: ${dir} is not a directory`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error accessing directory ${dir}:`, error);
      process.exit(1);
    }
  }));
};

/**
 * 规范化给定的文件系统路径，处理 '..' 和 '.' 片段，
 * 并根据操作系统将其转换为统一的格式。
 *
 * 此函数内部使用 `path.normalize` 方法来处理提供的
 * 文件路径字符串。
 *
 * @param {string} p - 需要规范化的文件系统路径
 * @returns {string} 规范化后的文件系统路径
 */
export const normalizePath = (p: string): string => {
  return path.normalize(p);
}

export const allowedDirectories = getArgs().map(dir =>
  normalizePath(path.resolve(expandHome(dir)))
);

// Security utilities
export async function validatePath(requestedPath: string): Promise<string> {
  const expandedPath = expandHome(requestedPath);
  const absolute = path.isAbsolute(expandedPath)
    ? path.resolve(expandedPath)
    : path.resolve(process.cwd(), expandedPath);

  const normalizedRequested = normalizePath(absolute);

  // Check if path is within allowed directories
  const isAllowed = allowedDirectories.some(dir => normalizedRequested.startsWith(dir));
  if (!isAllowed) {
    throw new Error(`Access denied - path outside allowed directories: ${absolute} not in ${allowedDirectories.join(', ')}`);
  }

  // Handle symlinks by checking their real path
  try {
    const realPath = await fs.realpath(absolute);
    const normalizedReal = normalizePath(realPath);
    const isRealPathAllowed = allowedDirectories.some(dir => normalizedReal.startsWith(dir));
    if (!isRealPathAllowed) {
      throw new Error("Access denied - symlink target outside allowed directories");
    }

    return realPath;
  } catch (error) {
    // For new files that don't exist yet, verify parent directory
    const parentDir = path.dirname(absolute);
    try {
      const realParentPath = await fs.realpath(parentDir);
      const normalizedParent = normalizePath(realParentPath);
      const isParentAllowed = allowedDirectories.some(dir => normalizedParent.startsWith(dir));
      if (!isParentAllowed) {
        throw new Error("Access denied - parent directory outside allowed directories");
      }

      return absolute;
    } catch {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }
  }
}
