const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/data", (req, res) => {
  try {
    const players = db.prepare("SELECT * FROM players").all();
    const scores = db.prepare("SELECT * FROM scores").all();
    res.json({ players, scores });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/api/players", (req, res) => {
  try {
    const { id, name, color, emoji } = req.body;
    db.prepare("INSERT INTO players (id, name, color, emoji) VALUES (?, ?, ?, ?)")
      .run(id, name, color, emoji || '🎳');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add player" });
  }
});

app.post("/api/scores", (req, res) => {
  try {
    const { id, playerId, score, date } = req.body;
    db.prepare("INSERT INTO scores (id, playerId, score, date) VALUES (?, ?, ?, ?)")
      .run(id, playerId, score, date);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to add score" });
  }
});

app.delete("/api/players/:id", (req, res) => {
  const { id } = req.params;
  db.prepare("DELETE FROM players WHERE id = ?").run(id);
  db.prepare("DELETE FROM scores WHERE playerId = ?").run(id);
  res.json({ success: true });
});

app.delete("/api/scores/:id", (req, res) => {
  try {
    const { id } = req.params;
    
    // On supprime uniquement le score qui correspond à cet ID
    const result = db.prepare("DELETE FROM scores WHERE id = ?").run(id);

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Score not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete score" });
  }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));