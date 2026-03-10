import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axios";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "" });
  const [error, setError] = useState("");

  const fetchClients = async () => {
    try {
      const res = await api.get("/clients");
      setClients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setEditClient(null);
    setForm({ name: "", email: "", phone: "", company: "" });
    setShowForm(true);
  };

  const openEdit = (client: Client) => {
    setEditClient(client);
    setForm({ name: client.name, email: client.email, phone: client.phone, company: client.company });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editClient) {
        await api.put(`/clients/${editClient.id}`, form);
      } else {
        await api.post("/clients", form);
      }
      setShowForm(false);
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this client?")) return;
    try {
      await api.delete(`/clients/${id}`);
      fetchClients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your clients</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Add Client
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">👥</p>
            <p className="font-medium">No clients yet</p>
            <p className="text-sm">Click "Add Client" to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Company</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{client.name}</td>
                    <td className="px-6 py-4 text-gray-500">{client.email}</td>
                    <td className="px-6 py-4 text-gray-500">{client.phone}</td>
                    <td className="px-6 py-4 text-gray-500">{client.company}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openEdit(client)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                {editClient ? "Edit Client" : "Add Client"}
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {["name", "email", "phone", "company"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                      {field}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={form[field as keyof typeof form]}
                      onChange={handleChange}
                      required={field === "name"}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                  >
                    {editClient ? "Save Changes" : "Add Client"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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

export default Clients;