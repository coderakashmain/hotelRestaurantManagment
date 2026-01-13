import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { initDatabase } from "./db/database"
import bcrypt from 'bcryptjs';
import { getDb } from './db/database';
let db: ReturnType<typeof getDb>;
import './license/activelicense'
import { licensingCheck } from './license/startup';

// import { enableAutoStart } from './start/autoLaunch'

process.on("unhandledRejection", err => {
  console.error(" UNHANDLED PROMISE:", err);
});

process.on("uncaughtException", err => {
  console.error(" UNCAUGHT EXCEPTION:", err);
});


app.setName("Restrox");


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

  ; (globalThis as any).__filename = __filename
  ; (globalThis as any).__dirname = __dirname

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

let win: BrowserWindow | null
let splash: BrowserWindow | null
let loginWin: BrowserWindow | null
let activationWin: BrowserWindow | null = null;

function createActivationWindow() {
  activationWin = new BrowserWindow({
    width: 720,
    height: 420,
    resizable: false,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "./preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  activationWin.loadFile(
    path.join(process.env.VITE_PUBLIC as string, "activation.html")
  );
}

function createSplash() {
  splash = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: true,
  })

  splash.loadFile(path.join(process.env.VITE_PUBLIC as string, 'splash.html'))
}

function createLoginWindow() {
  loginWin = new BrowserWindow({
    width: 620,
    height: 520,
    resizable: false,
    frame: false,
    show: true,
    autoHideMenuBar: true,
    icon: path.join(process.env.VITE_PUBLIC as string, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, "./preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loginWin.loadFile(
    path.join(process.env.VITE_PUBLIC as string, 'login.html')
  )
}





function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    icon: path.join(process.env.VITE_PUBLIC as string, 'electron-vite.svg'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "./preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send(
      'main-process-message',
      new Date().toLocaleString()
    )
  })
  win.once('ready-to-show', () => {
    win?.show()
  })


  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}


/* =============================
   APP LIFE CYCLE
============================= */

function isFirstRun(): boolean {
  try {
    // Check if user_account table exists
    const table = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='user_account'`
      )
      .get();

    if (!table) return true; // table not created yet

    // Check if at least one user exists
    const count = db
      .prepare(`SELECT COUNT(*) as count FROM user_account`)
      .get() as { count: number };

    return count.count === 0; // no users → first run
  } catch (err) {
    console.error("First run check failed:", err);
    return true; // safest fallback
  }
}



app.whenReady().then(async () => {

  createSplash();

  //  Initialize DB first
  initDatabase();

  //  NOW it is safe
  db = getDb();

  import("./ipc/index");

  const { runDailyBilling } = await import("./cron/runDailyBilling");
  const { startDailyBillingCron } = await import("./cron/dailyBillingCron");

  await runDailyBilling();
  startDailyBillingCron();

  setTimeout(async () => {
    try {
      //  DO NOT close splash yet
      // Keep at least one window alive during async work

      // 1️ LICENSE CHECK (async network call)
      if (isFirstRun()) {
        if (splash) {
          splash.close();
          splash = null;
        }
        createWindow();
        return;
      }
      const licenseStatus = await licensingCheck();

      // 2️ Now it is SAFE to close splash
      if (splash) {
        splash.close();
        splash = null;
      }

      
      // 3️ Handle result
      if (licenseStatus === "ACTIVATION_REQUIRED") {
        createActivationWindow();
        return;
      }

      // 4️ LICENSED or TRIAL → normal flow
      if (isFirstRun()) {
        createWindow();
      } else {
        createLoginWindow();
      }

    } catch (err) {
      console.error(" STARTUP ERROR:", err);

      // Fail-safe: show activation instead of crashing
      if (splash) {
        splash.close();
        splash = null;
      }
      createActivationWindow();
    }
  }, 1500);


});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})


ipcMain.on('login-success', () => {
  if (loginWin) {
    loginWin.close()
    loginWin = null
  }

  createWindow()
})

ipcMain.on("login-attempt", async (event, { username, password }) => {
  try {
    const user = db.prepare(`
      SELECT * FROM user_account
      WHERE (username = ? OR email = ?)
      LIMIT 1
    `).get(username, username) as any;

    //  No user found
    if (!user) {
      event.sender.send("login-result", {
        success: false,
        message: "Invalid username or password",
      });
      return;
    }

    //  Compare hashed password (ASYNC)
    const match = await bcrypt.compare(password, user.password_hash);

    if (match) {
      event.sender.send("login-result", {
        success: true,
        message: "Verified successfully",
      });
    } else {
      event.sender.send("login-result", {
        success: false,
        message: "Invalid username or password",
      });
    }
  } catch (err) {
    console.error("Login error:", err);
    event.sender.send("login-result", {
      success: false,
      message: "Server error",
    });
  }
});



