const path = require('path');
const { name, version } = require(path.resolve(process.cwd(), 'package.json'));

module.exports = {
  reporter: 'mochawesome',
  colors: true,
  spec: ['test/**/*.test.ts', 'test/**/*.spec.ts'],
  'reporter-option': [
    'reportDir=docs',
    `reportTitle=${name}\u0020v${version}`,
    `reportPageTitle=${name}\u0020report`,
    'reportFilename=index'
  ]
}