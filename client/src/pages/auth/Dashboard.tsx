import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

interface Stats {
  clients: number;
  projects: number;
  totalTasks: number;
  completedTasks: number;
  activeProjects: number;
}

interface Project {
  id: number;
  name: string;
  status: string;
  due_date: string;
  client_name: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    clients: 0,
    projects: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientsRes, projectsRes] = await Promise.all([
          api.get("/clients"),
          api.get("/projects"),
        ]);

        const projects: Project[] = projectsRes.data;
        const activeProjects = projects.filter((p) => p.status === "active").length;

        // Fetch tasks for all projects
        const taskResults = await Promise.all(
          projects.map((p) => api.get(`/tasks/project/${p.id}`))
        );

        const allTasks = taskResults.flatMap((r) => r.data);
        const completedTasks = allTasks.filter((t) => t.completed).length;

        setStats({
          clients: clientsRes.data.length,
          projects: projects.length,
          totalTasks: allTasks.length,
          completedTasks,
          activeProjects,
        });

        setRecentProjects(projects.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    on_hold: "bg-yellow-100 text-yellow-700",
  };

  const cards = [
    { label: "Total Clients", value: stats.clients, icon: "👥", color: "bg-blue-50 text-blue-600" },
    { label: "Total Projects", value: stats.projects, icon: "📁", color: "bg-purple-50 text-purple-600" },
    { label: "Active Projects", value: stats.activeProjects, icon: "🚀", color: "bg-green-50 text-green-600" },
    { label: "Tasks Completed", value: `${stats.completedTasks}/${stats.totalTasks}`, icon: "✅", color: "bg-orange-50 text-orange-600" },
  ];

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4"
                >
                  <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-lg ${card.color}`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Task Progress */}
            {stats.totalTasks > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">Overall Task Progress</span>
                  <span>{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recent Projects */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Recent Projects</h2>
              </div>
              {recentProjects.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>No projects yet</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 text-left">Project</th>
                      <th className="px-6 py-3 text-left">Client</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{project.name}</td>
                        <td className="px-6 py-4 text-gray-500">{project.client_name || "—"}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || "bg-gray-100 text-gray-600"}`}>
                            {project.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {project.due_date ? new Date(project.due_date).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;