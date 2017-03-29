const { findUsedModules, traverse } = require('../src/project');
const path = require('path');

beforeAll(() => {
  process.cwd = jest.fn(() => path.resolve(__dirname, '..', 'fake_apps'));
});

test('reads included project files', async () => {
  const rootPath = path.resolve(process.cwd(), './simple');
  const files = await findUsedModules(rootPath, 'src/entry.js');

  expect(files).toEqual([
    'src/entry.js',
    'src/modules1/a1.js',
    'src/modules1/a2.js',
    'src/modules2/b1.js',
  ]);
});

test('should return absolute paths when option is set', async () => {
  const rootPath = path.resolve(process.cwd(), './simple');
  const options = {
    showRelativePaths: false,
  };

  const files = await findUsedModules(rootPath, 'src/entry.js', options);

  expect(files).toEqual([
    path.resolve(rootPath, 'src/entry.js'),
    path.resolve(rootPath, 'src/modules1/a1.js'),
    path.resolve(rootPath, 'src/modules1/a2.js'),
    path.resolve(rootPath, 'src/modules2/b1.js'),
  ]);
});

test('traverses all module files', async () => {
  const entryFile = path.resolve(process.cwd(), 'simple', 'src/entry.js');
  const result = await traverse(entryFile);

  const expected = [
    'src/entry.js',
    'src/modules1/a1.js',
    'src/modules1/a2.js',
    'src/modules2/b1.js',
  ].map(file => path.resolve(process.cwd(), 'simple', file));

  expect(result).toEqual(expected);
});
