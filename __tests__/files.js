const path = require('path');

const {
  nameWithExtension,
  escapeRegExp,
  formatExtension,
  isValidFile,
  fullFilePath,
  relativePaths,
} = require('../src/files');

beforeAll(() => {
  process.cwd = jest.fn(() => path.resolve(__dirname, '..', 'fake_apps'));
});

test('should throw when argument is not a string', () => {
  expect(() => nameWithExtension(1)).toThrow();
  expect(() => nameWithExtension(null)).toThrow();
  expect(() => nameWithExtension()).toThrow();
  expect(() => nameWithExtension({})).toThrow();
  expect(() => nameWithExtension([])).toThrow();
  expect(() => nameWithExtension(Symbol())).toThrow();

  expect(() => nameWithExtension('string')).not.toThrow();
});

test("doesn't add extension if already has one", () => {
  expect(nameWithExtension('./src/file.js')).toBe('./src/file.js');
  expect(nameWithExtension('./src/file.jsx', '.jsx')).toBe('./src/file.jsx');
});

test('should add extension if without any', () => {
  expect(nameWithExtension('./src/file')).toBe('./src/file.js');
  expect(nameWithExtension('./src/file', 'js')).toBe('./src/file.js');
  expect(nameWithExtension('./src/file', '.jsx')).toBe('./src/file.jsx');
  expect(nameWithExtension('./src/file', 'jsx')).toBe('./src/file.jsx');
});

test('should escape special regexp characters', () => {
  expect(escapeRegExp(`.js`)).toBe(String.raw`\.js`);
  expect(escapeRegExp(`js`)).toBe(String.raw`js`);
  expect(escapeRegExp(`file.react.js`)).toBe(String.raw`file\.react\.js`);
});

test("should add dot before extension if doesn't have one", () => {
  expect(formatExtension('js')).toBe('.js');
  expect(formatExtension('.js')).toBe('.js');
  expect(formatExtension('jsxdsa')).toBe('.jsxdsa');
});

test('should show if file exists', async () => {
  const rootPath = path.resolve(process.cwd(), 'simple');

  const file1 = path.resolve(rootPath, 'src/entry.js');
  const file2 = path.resolve(rootPath, 'src/entry');
  const file3 = path.resolve(rootPath, 'src/idontexist');
  const file4 = path.resolve(rootPath, 'src/modules1/a1.js');

  expect(await isValidFile(file1, '.js')).toBe(true);
  expect(await isValidFile(file1, '.jsx')).toBe(false);
  expect(await isValidFile(file2, '.js')).toBe(true);
  expect(await isValidFile(file3, '.jsx')).toBe(false);
  expect(await isValidFile(file3, '.js')).toBe(false);
  expect(await isValidFile(file4, '.js')).toBe(true);
});

test('should get full file path', async () => {
  const rootPath = path.resolve(process.cwd(), 'simple');

  const entry = path.resolve(rootPath, 'src/entry');
  const entryWithExtension = path.resolve(rootPath, 'src/entry.js');

  expect(await fullFilePath(entryWithExtension, ['.jsx', 'js'])).toBe(
    entryWithExtension,
  );

  expect(await fullFilePath(entry, ['.css', '.js', '.jsx'])).toBe(
    entryWithExtension,
  );
});

test('should extract realtive paths', () => {
  const rootPath = '/Users/test-user/project';

  const paths = [
    path.join(rootPath, './file1.js'),
    path.join(rootPath, './src/file2.js'),
    path.join(rootPath, 'some/deep/structure/file2.jsx'),
  ];

  expect(relativePaths(rootPath, paths)).toEqual([
    'file1.js',
    'src/file2.js',
    'some/deep/structure/file2.jsx',
  ]);
});
