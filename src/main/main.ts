import { userConfig } from './_config';

import path from 'path';
import fs from 'fs';
import { exec, execSync } from 'child_process';

import
{
  app, BrowserWindow, ipcMain,
  Tray, Menu, dialog,
}
  from 'electron';

// Force locale since external tools may reference it.
app.commandLine.appendSwitch('lang', 'en-US');

// Disable the disk cache for HTTP requests.
app.commandLine.appendSwitch('disable-http-cache', 'true');

// Ignore certificate related errors.
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

// Enable garbage collection to be triggered manually.
app.commandLine.appendSwitch('js-flags', '--expose_gc');
app.commandLine.appendSwitch('js-flags', '--expose-gc');

// The absolute path to the application directory.
const ABSPATH = app.getAppPath();

// Make sure we are logged in to the attached documents server.
try
{
  execSync(`net use "${userConfig.filesystem.docsServer.server}" /user:"${userConfig.filesystem.docsServer.username}" "${userConfig.filesystem.docsServer.password}"`);
}
// eslint-disable-next-line no-empty
catch (err) {}

// Quit app when all windows are closed.
app.on('window-all-closed', () => app.quit());

let tray: Tray;
let doQuit = false;

// let splashWindow: BrowserWindow;
let mainWindow: BrowserWindow;

/**
 * Properly quits the application.
 */
const quitApplication = () =>
{
  // Remove the tray icon.
  tray.destroy();

  // Allows the main window to close instead of being minimized to the tray.
  doQuit = true;

  // Triggers: app.on('window-all-closed', () => app.quit());
  BrowserWindow.getAllWindows().forEach(appWindow => appWindow.close());
};

/**
 * The template for the tray menu.
 */
const contextMenu = Menu.buildFromTemplate([
  {
    label: 'Exit',
    // Role: 'quit',
    click: quitApplication,
  },
]);

/**
 * The template for the application menu.
 */
const applicationMenu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        // Role: 'quit',
        click: quitApplication,
      },
    ],
  },
  {
    label: 'Edit',
    role: 'editMenu',
  },
  {
    label: 'View',
    role: 'viewMenu',
  },
  {
    label: 'Window',
    role: 'windowMenu',
  },
  {
    label: 'About',
    click: () =>
    {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: `About ${app.name}`,
        message: 'Made by Bob Vandevliet' +
          '\n' +
          `\nPeazy  v${app.getVersion()}` +
          `\nElectron.js  v${process.versions.electron}` +
          `\nNode.js  v${process.versions.node}` +
          `\nChromium  v${process.versions.chrome}`,
      });
    },
  },
]);

/**
 * Creates the main window.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/quick-start
 */
const createWindow = () =>
{
  // Don't re-create if already exists.
  if (typeof mainWindow === typeof BrowserWindow) return;

  // Definition of the main window.
  mainWindow = new BrowserWindow({
    show: false, // @see 'ready-to-show' event
    autoHideMenuBar: true,
    minWidth: 768,
    minHeight: 768,
    icon: path.join(__dirname, '../../src/renderer/assets/img/favicon.ico'),
    webPreferences: {
      spellcheck: false,
      devTools: true,
      preload: path.join(__dirname, '/preload.js'),
    },
  })

    // Update tray tooltip when the window document title changes.
    .on('page-title-updated', (_e, title) => tray.setToolTip(title))

    // Show the window when the page has been rendered, to prevent a visual flash.
    .once('ready-to-show', () =>
    {
      // Triggers: mainWindow.once('show', () => {})
      mainWindow.show();
    })

    // Close the splash window and maximize the main window when ready to show.
    .once('show', () =>
    {
      // SplashWindow.close();
      mainWindow.maximize();
    })

    // Handle the window's close event.
    .on('close', e =>
    {
      if (!doQuit)
      {
        e.preventDefault();
        mainWindow.hide();
      }
    });

  // Then render the page.
  mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'));

  // Watch for file changes in development mode for live reload.
  if (process.argv[2] === '--dev')
  {
    let reloading = false;
    fs.watch(path.join(ABSPATH, './src/renderer/'), { recursive: true, persistent: true }, () =>
    {
      if (reloading) return;
      reloading = true;
      exec('npm run dist', err => { reloading = false; if (err) return; mainWindow.webContents.reloadIgnoringCache(); });
    });
  }
};

/**
 * Called when Electron has finished initialization
 * and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.whenReady().then(() =>
{
  // Set the application menu.
  Menu.setApplicationMenu(applicationMenu);

  // Create the tray icon.
  tray = new Tray(path.join(__dirname, '../../src/renderer/assets/img/favicon.ico'));

  // Set the tray menu.
  tray.setContextMenu(contextMenu);

  // Create the main window.
  createWindow();

  // Show/hide window support.
  tray.on('click', () => mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show());
});

/**
 * Native File Drag & Drop.
 *
 * @link https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop
 */
ipcMain.on('ondragstart', (e, filePath: string) =>
{
  e.sender.startDrag({
    file: path.join(__dirname, filePath),
    icon: path.join(__dirname, '../../src/renderer/assets/img/empty.ico'),
  });
});

/**
 * Get file icon.
 */
ipcMain.on('file-icon', (e, filePath: string, options?: Electron.FileIconOptions) =>
{
  app.getFileIcon(filePath, options)
    .then(nativeImg => e.sender.send(`file-icon-data-${filePath}`, nativeImg.toDataURL()));
});

/**
 * Popup contextmenu.
 */
ipcMain.on('context-menu', (e, menuItems: Electron.MenuItem[]) =>
{
  menuItems.forEach(menuItem =>
  {
    menuItem.click = () => e.sender.send('context-menu-command', menuItem.id);
    menuItem.icon = path.join(ABSPATH, menuItem.icon as string);
  });

  Menu.buildFromTemplate(menuItems).popup({ window: BrowserWindow.fromWebContents(e.sender) });
});

/*
 * In this file you can include the rest of your app's specific main process code.
 * You can also put them in separate files and require them here.
 */