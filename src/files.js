const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const DEFAULT_EXTENSIONS = ['.js', '.jsx'];

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function formatExtension(str) {
  if (/^\./.test(str)) {
    return str;
  }

  return '.' + str;
}

async function fileExists(file) {
  try {
    const stat = await fs.statAsync(file);
    return stat.isFile();
  } catch (error) {
    return false;
  }
}

function nameWithExtension(pathname, extension = '.js') {
  if (typeof pathname !== 'string') {
    throw new Error('Pathname should be a string');
  }

  // Ends with extension
  const expression = new RegExp(escapeRegExp(extension) + '$');
  if (expression.test(pathname)) {
    return pathname;
  }

  return pathname + formatExtension(extension);
}

async function isValidFile(pathname, extension, resultWithPathname = false) {
  const filepath = nameWithExtension(pathname, extension);
  const exists = await fileExists(filepath);

  if (resultWithPathname) {
    return {
      exists,
      filepath,
    };
  }

  return exists;
}

async function fullFilePath(pathname, extensions = DEFAULT_EXTENSIONS) {
  try {
    const promises = extensions.map(e => isValidFile(pathname, e));
    const checks = await Promise.all(promises);

    return checks
      .map((exists, index) => {
        return [exists, nameWithExtension(pathname, extensions[index])];
      })
      .filter(([exists]) => exists)
      .reduce((_, [, name]) => name, null);
  } catch (error) {
    return null;
  }
}

function relativePaths(rootPath, files) {
  return files.map(f => path.relative(rootPath, f));
}

function unusedFiles(allFiles, modules) {
  return allFiles.filter(file => !modules.includes(file));
}

module.exports = {
  nameWithExtension,
  relativePaths,
  escapeRegExp,
  formatExtension,
  isValidFile,
  fileExists,
  fullFilePath,
  unusedFiles,
};
