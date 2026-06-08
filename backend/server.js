const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

const VALID_COLORS = ['blue', 'red', 'emerald', 'yellow', 'purple', 'pink'];

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api/data", (req, res) => {
  try {
    const players = db.prepare("SELECT * FROM players").all();
    const scores = db.prepare("SELECT * FROM scores ORDER BY date DESC").all();
    res.json({ players, scores });
  } catch {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.post("/api/players", (req, res) => {
  try {
    const { id, name, color, emoji } = req.body;
    if (!id || typeof id !== 'string')
      return res.status(400).json({ error: "Invalid id" });
    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 50)
      return res.status(400).json({ error: "Le nom est requis (50 caractères max)" });
    if (!VALID_COLORS.includes(color))
      return res.status(400).json({ error: "Couleur invalide" });

    db.prepare("INSERT INTO players (id, name, color, emoji) VALUES (?, ?, ?, ?)")
      .run(id, name.trim(), color, emoji || '🎳');
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to add player" });
  }
});

app.post("/api/scores", (req, res) => {
  try {
    const { id, playerId, score, date } = req.body;
    if (!id || typeof id !== 'string')
      return res.status(400).json({ error: "Invalid id" });
    if (!playerId || typeof playerId !== 'string')
      return res.status(400).json({ error: "Invalid playerId" });

    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 300)
      return res.status(400).json({ error: "Le score doit être entre 0 et 300" });
    if (!date || isNaN(Date.parse(date)))
      return res.status(400).json({ error: "Date invalide" });

    const player = db.prepare("SELECT id FROM players WHERE id = ?").get(playerId);
    if (!player)
      return res.status(404).json({ error: "Joueur introuvable" });

    db.prepare("INSERT INTO scores (id, playerId, score, date) VALUES (?, ?, ?, ?)")
      .run(id, playerId, scoreNum, date);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to add score" });
  }
});

app.delete("/api/players/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid id" });

    const result = db.prepare("DELETE FROM players WHERE id = ?").run(id);
    db.prepare("DELETE FROM scores WHERE playerId = ?").run(id);
    if (result.changes === 0)
      return res.status(404).json({ error: "Joueur introuvable" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete player" });
  }
});

app.delete("/api/scores/:id", (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Invalid id" });

    const result = db.prepare("DELETE FROM scores WHERE id = ?").run(id);
    if (result.changes === 0)
      return res.status(404).json({ error: "Score introuvable" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to delete score" });
  }
});

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
