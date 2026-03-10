import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axios";

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  project_id: number;
  created_at: string;
}

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "" });
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (projectId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchTasks(selectedProject);
  }, [selectedProject]);

  const handleToggle = async (task: Task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        title: task.title,
        completed: !task.completed,
      });
      fetchTasks(selectedProject!);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editTask) {
        await api.put(`/tasks/${editTask.id}`, {
          title: form.title,
          completed: editTask.completed,
        });
      } else {
        await api.post(`/tasks/project/${selectedProject}`, form);
      }
      setShowForm(false);
      setForm({ title: "" });
      setEditTask(null);
      fetchTasks(selectedProject!);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks(selectedProject!);
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setForm({ title: task.title });
    setShowForm(true);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">Manage tasks per project</p>
          </div>
          {selectedProject && (
            <button
              onClick={() => {
                setEditTask(null);
                setForm({ title: "" });
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Add Task
            </button>
          )}
        </div>

        {/* Project Selector */}
        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📁</p>
            <p className="font-medium">No projects found</p>
            <p className="text-sm">Create a project first before adding tasks</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap mb-6">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedProject === project.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>

            {/* Progress Bar */}
            {tasks.length > 0 && (
              <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{completedCount}/{tasks.length} completed</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tasks List */}
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-medium">No tasks yet</p>
                <p className="text-sm">Click "Add Task" to get started</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggle(task)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                      <span className={`text-sm ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {task.title}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(task)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {editTask ? "Edit Task" : "Add Task"}
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={(e) => setForm({ title: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Design homepage mockup"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                  >
                    {editTask ? "Save Changes" : "Add Task"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditTask(null);
                      setForm({ title: "" });
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;