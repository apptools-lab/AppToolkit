// @ts-nocheck
// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  ['chrome', 'node', 'electron'].forEach(type => {
    console.log(`${type}-version`, process.versions[type]);
  });
});
