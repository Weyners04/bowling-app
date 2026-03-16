const Database = require("better-sqlite3");
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'database.db'));

// Initialisation avec le nouveau champ emoji
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🎳'
  );

  CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    playerId TEXT NOT NULL,
    score INTEGER NOT NULL,
    date TEXT NOT NULL
  );
`);

module.exports = db;