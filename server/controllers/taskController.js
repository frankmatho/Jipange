const pool = require("../config/db");

// GET all tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const { project_id } = req.params;

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC",
      [project_id]
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// CREATE task
exports.createTask = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { title } = req.body;

    const newTask = await pool.query(
      "INSERT INTO tasks (project_id, title) VALUES ($1, $2) RETURNING *",
      [project_id, title]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// TOGGLE task completed
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const updated = await pool.query(
      "UPDATE tasks SET title=$1, completed=$2 WHERE id=$3 RETURNING *",
      [title, completed, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// DELETE task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};