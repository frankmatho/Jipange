const pool = require("../config/db");

// GET all clients for logged-in user
exports.getClients = async (req, res) => {
  try {
    const clients = await pool.query(
      "SELECT * FROM clients WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(clients.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// GET single client
exports.getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await pool.query(
      "SELECT * FROM clients WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (client.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// CREATE client
exports.createClient = async (req, res) => {
  try {
    const { name, email, phone, company } = req.body;

    const newClient = await pool.query(
      "INSERT INTO clients (user_id, name, email, phone, company) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, name, email, phone, company]
    );

    res.status(201).json(newClient.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// UPDATE client
exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company } = req.body;

    const updated = await pool.query(
      `UPDATE clients SET name=$1, email=$2, phone=$3, company=$4
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [name, email, phone, company, id, req.user.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// DELETE client
exports.deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await pool.query(
      "DELETE FROM clients WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};