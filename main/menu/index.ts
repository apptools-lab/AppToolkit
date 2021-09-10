import { Menu, app, shell, dialog } from 'electron';
import * as electronLog from 'electron-log';
import { createAboutWindow } from '../window';
import { checkForUpdates } from '../autoUpdater';
import * as compareVersions from 'compare-versions';

const { version: currentVersion } = require('../../package.json');

function setAppMenu() {
  const appMenu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          label: '关于 AppToolkit',
          click() {
            createAboutWindow();
          },
        },
        { type: 'separator' },
        {
          label: '检查更新',
          click: async () => {
            const updateInfo = await checkForUpdates();
            if (updateInfo) {
              const { versionInfo } = updateInfo;
              if (
                versionInfo &&
              versionInfo.version &&
              compareVersions.compare(currentVersion, versionInfo.version, '>=')
              ) {
                dialog.showMessageBoxSync({
                  type: 'info',
                  message: 'AppToolkit 已经是最新版本！',
                  buttons: ['好'],
                });
              }
            }
          },
        },
        { type: 'separator' },
        {
          label: '服务',
          role: 'services',
          submenu: [],
        },
        { type: 'separator' },
        { label: '隐藏 AppToolkit', role: 'hide' },
        { label: '全部显示', role: 'unhide' },
        { type: 'separator' },
        {
          label: '退出',
          role: 'quit',
          accelerator: 'Cmd+Q',
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          role: 'undo',
          accelerator: 'CommandOrControl+Z',
        },
        {
          label: '重做',
          role: 'redo',
          accelerator: 'CommandOrControl+Shift+Z',
        },
        { type: 'separator' },
        {
          label: '剪切',
          role: 'cut',
          accelerator: 'CommandOrControl+X',
        },
        {
          label: '复制',
          role: 'copy',
          accelerator: 'CommandOrControl+C',
        },
        {
          label: '粘贴',
          role: 'paste',
          accelerator: 'CommandOrControl+V',
        },
        {
          label: '选择全部',
          role: 'selectAll',
          accelerator: 'CommandOrControl+A',
        },
      ],
    },
    {
      label: '窗口',
      submenu: [
        {
          label: '关闭',
          role: 'close',
          accelerator: 'CommandOrControl+W',
        },
        {
          label: '刷新',
          role: 'reload',
          accelerator: 'CommandOrControl+R',
        },
        {
          label: '最小化',
          role: 'minimize',
          accelerator: 'CommandOrControl+M',
        },
        {
          label: '缩放',
          role: 'zoom',
        },
        {
          label: '切换全屏',
          role: 'togglefullscreen',
          accelerator: 'Ctrl+Command+F',
        },
        { type: 'separator' },
        {
          label: '全部置于顶层',
          role: 'front',
        },
      ],
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '发布日志',
          click() {
            shell.openExternal(
              'https://github.com/appworks-lab/toolkit/releases',
            );
          },
        },
        {
          label: '切换开发人员工具',
          accelerator: 'Alt+Command+I',
          click(item, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          },
        },
        {
          label: '查看运行日志',
          click() {
            const logPath = electronLog.transports.file.findLogPath(app.getName());
            shell.showItemInFolder(logPath);
          },
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(appMenu);
}

export default setAppMenu;
