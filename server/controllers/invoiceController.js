const pool = require("../config/db");

// GET all invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await pool.query(
      `SELECT invoices.*, clients.name AS client_name, projects.name AS project_name
       FROM invoices
       LEFT JOIN clients ON invoices.client_id = clients.id
       LEFT JOIN projects ON invoices.project_id = projects.id
       WHERE invoices.user_id = $1
       ORDER BY invoices.created_at DESC`,
      [req.user.id]
    );
    res.json(invoices.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// GET single invoice
exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await pool.query(
      `SELECT invoices.*, clients.name AS client_name, projects.name AS project_name
       FROM invoices
       LEFT JOIN clients ON invoices.client_id = clients.id
       LEFT JOIN projects ON invoices.project_id = projects.id
       WHERE invoices.id = $1 AND invoices.user_id = $2`,
      [id, req.user.id]
    );

    if (invoice.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// CREATE invoice
exports.createInvoice = async (req, res) => {
  try {
    const { client_id, project_id, amount, status, due_date } = req.body;

    const newInvoice = await pool.query(
      `INSERT INTO invoices (user_id, client_id, project_id, amount, status, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, client_id, project_id || null, amount, status || "unpaid", due_date]
    );

    res.status(201).json(newInvoice.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// UPDATE invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, project_id, amount, status, due_date } = req.body;

    const updated = await pool.query(
      `UPDATE invoices SET client_id=$1, project_id=$2, amount=$3, status=$4, due_date=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [client_id, project_id || null, amount, status, due_date, id, req.user.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// DELETE invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await pool.query(
      "DELETE FROM invoices WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ message: "Invoice deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};