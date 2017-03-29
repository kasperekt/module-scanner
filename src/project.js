const Promise = require('bluebird');
const path = require('path');
const fs = Promise.promisifyAll(require('fs'));
const babylon = require('babylon');
const {
  fileExists,
  fullFilePath,
  relativePaths,
  isValidFile,
} = require('./files');
const klaw = require('klaw-sync');

const defaultOptions = {
  showRelativePaths: true,
};

const babylonOptions = {
  sourceType: 'module',
};

async function traverse(file) {
  if (!await fileExists(file)) {
    return [];
  }

  const rootDir = path.dirname(file);
  const code = await fs.readFileAsync(file, 'utf8');
  const ast = babylon.parse(code, babylonOptions);

  const importDeclarations = ast.program.body.filter(
    node => node.type === 'ImportDeclaration',
  );

  const nextModulesNamesPromises = importDeclarations
    .map(declaration => declaration.source.value)
    .map(m => {
      const nextModulePath = path.resolve(rootDir, m);
      return fullFilePath(nextModulePath);
    });

  try {
    const nextModules = await Promise.all(nextModulesNamesPromises)
      .filter(truthy => truthy)
      .map(moduleName => traverse(moduleName))
      .reduce((allModules, deps) => [...allModules, ...deps], [file]);

    return nextModules;
  } catch (error) {
    return [];
  }
}

async function findUsedModules(projectPath, entry, options = defaultOptions) {
  if (!projectPath || !entry) {
    return [];
  }

  const entryPath = path.resolve(process.cwd(), projectPath, entry);
  const rootPath = path.resolve(process.cwd(), projectPath);

  let modules = await traverse(entryPath, rootPath);

  if (options.showRelativePaths) {
    modules = relativePaths(projectPath, modules);
  }

  return modules;
}

async function findAllModules(projectPath) {
  if (!projectPath) {
    return [];
  }

  const extensions = ['.js', '.jsx'];
  const klawOptions = { ignore: 'node_modules', nodir: true };

  const files = klaw(projectPath, klawOptions).map(f => f.path);
  const validFilesPromises = extensions
    .map(e => files.map(f => isValidFile(f, e, true)))
    .reduce((combined, promises) => [...combined, ...promises], []);

  const validFiles = await Promise.all(validFilesPromises)
    .filter(({ exists }) => exists)
    .map(({ filepath }) => filepath);

  return relativePaths(projectPath, validFiles);
}

module.exports = {
  findAllModules,
  findUsedModules,
  traverse,
};
