const findUnused = require('../index');
const path = require('path');

beforeAll(() => {
  process.cwd = jest.fn(() => path.resolve(__dirname, '..'));
});

test('empty arguments', async () => {
  expect(await findUnused()).toEqual([]);
});

test('simple fake app unused modules', async () => {
  const unused = await findUnused('./fake_apps/simple', './src/entry.js');

  expect(unused).toEqual([
    'src/modules1/a3_unused.js',
    'src/modules3/c1_unused.js',
    'src/modules3/c2_unused.js',
  ]);
});
