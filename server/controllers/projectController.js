const pool = require("../config/db");

// GET all projects for logged-in user
exports.getProjects = async (req, res) => {
  try {
    const projects = await pool.query(
      `SELECT projects.*, clients.name AS client_name 
       FROM projects 
       LEFT JOIN clients ON projects.client_id = clients.id
       WHERE projects.user_id = $1 
       ORDER BY projects.created_at DESC`,
      [req.user.id]
    );
    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// GET single project
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await pool.query(
      `SELECT projects.*, clients.name AS client_name 
       FROM projects 
       LEFT JOIN clients ON projects.client_id = clients.id
       WHERE projects.id = $1 AND projects.user_id = $2`,
      [id, req.user.id]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// CREATE project
exports.createProject = async (req, res) => {
  try {
    const { client_id, name, description, status, due_date } = req.body;

    const newProject = await pool.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, client_id, name, description, status || "active", due_date]
    );

    res.status(201).json(newProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// UPDATE project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, name, description, status, due_date } = req.body;

    const updated = await pool.query(
      `UPDATE projects SET client_id=$1, name=$2, description=$3, status=$4, due_date=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [client_id, name, description, status, due_date, id, req.user.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// DELETE project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user.id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};