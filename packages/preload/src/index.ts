window.addEventListener('DOMContentLoaded', () => {
  ['chrome', 'node', 'electron'].forEach((type) => {
    console.log(`${type}-version`, process.versions[type]);
  });
});
