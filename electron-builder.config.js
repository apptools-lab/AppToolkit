module.exports = {
  appId: 'AppToolkit',
  productName: 'AppToolkit',
  files: [
    'packages/**/build/**',
    '!node_modules',
  ],
  directories: {
    output: 'release',
    buildResources: 'resources',
  },
  copyright: 'Copyright © 2021-present AppToolkit',
};
