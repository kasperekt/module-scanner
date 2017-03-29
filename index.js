const { findUsedModules, findAllModules } = require('./src/project');
const { unusedFiles } = require('./src/files');

async function findUnusedModules(projectPath, entry) {
  const allModulesPromise = findAllModules(projectPath);
  const usedModulesPromise = findUsedModules(projectPath, entry);

  const [allModules, usedModules] = await Promise.all([
    allModulesPromise,
    usedModulesPromise,
  ]);

  return unusedFiles(allModules, usedModules);
}

module.exports = findUnusedModules;
