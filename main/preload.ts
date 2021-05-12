// add draggable dom at the top of Window
function initTopDrag() {
  const topDiv = document.createElement('div');
  topDiv.style.position = 'fixed';
  topDiv.style.top = '0';
  topDiv.style.left = '0';
  topDiv.style.height = '30px';
  topDiv.style.width = '100%';
  topDiv.style.zIndex = '9999';
  topDiv.style.pointerEvents = 'none';
  topDiv.style['-webkit-user-select'] = 'none';
  topDiv.style['-webkit-app-region'] = 'drag';
  document.body.appendChild(topDiv);
}

window.addEventListener('DOMContentLoaded', () => {
  ['chrome', 'node', 'electron'].forEach((type) => {
    console.log(`${type}-version`, process.versions[type]);
  });

  initTopDrag();
});

