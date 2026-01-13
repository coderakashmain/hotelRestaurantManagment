const fs = require("fs");
const path = require("path");
const os = require("os");

// Get userData path from command line
const userData = process.argv[2];
if (!userData) process.exit(0);

// YOUR DB PATH
const dbFolder = path.join(
  userData,
  "hotelrestaurentmanagment"
);

const dbFile = path.join(
  dbFolder,
  "hotelmanagment.db"
);

// Backup location (safe)
const backupDir = path.join(
  os.homedir(),
  "Documents",
  "Restrox Backups"
);

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

if (fs.existsSync(dbFile)) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const backupFile = path.join(
    backupDir,
    `hotelmanagment-backup-${timestamp}.db`
  );

  fs.copyFileSync(dbFile, backupFile);
}
