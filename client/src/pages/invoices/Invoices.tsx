import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/axios";

interface Client {
  id: number;
  name: string;
}

interface Project {
  id: number;
  name: string;
}

interface Invoice {
  id: number;
  client_id: number;
  project_id: number;
  amount: number;
  status: string;
  due_date: string;
  client_name: string;
  project_name: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  unpaid: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState({
    client_id: "",
    project_id: "",
    amount: "",
    status: "unpaid",
    due_date: "",
  });
  const [error, setError] = useState("");

  const fetchAll = async () => {
    try {
      const [invoicesRes, clientsRes, projectsRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/clients"),
        api.get("/projects"),
      ]);
      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openCreate = () => {
    setEditInvoice(null);
    setForm({ client_id: "", project_id: "", amount: "", status: "unpaid", due_date: "" });
    setShowForm(true);
  };

  const openEdit = (invoice: Invoice) => {
    setEditInvoice(invoice);
    setForm({
      client_id: String(invoice.client_id),
      project_id: String(invoice.project_id || ""),
      amount: String(invoice.amount),
      status: invoice.status,
      due_date: invoice.due_date?.slice(0, 10) || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        client_id: Number(form.client_id),
        project_id: form.project_id ? Number(form.project_id) : null,
        amount: parseFloat(form.amount),
      };
      if (editInvoice) {
        await api.put(`/invoices/${editInvoice.id}`, payload);
      } else {
        await api.post("/invoices", payload);
      }
      setShowForm(false);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this invoice?")) return;
    try {
      await api.delete(`/invoices/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  // Summary stats
  const totalAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);
  const unpaidAmount = invoices
    .filter((inv) => inv.status === "unpaid")
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <Layout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
            <p className="text-gray-500 text-sm mt-1">Track payments and billing</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + New Invoice
          </button>
        </div>

        {/* Summary Cards */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Total Billed", value: totalAmount, color: "bg-blue-50 text-blue-600", icon: "💰" },
              { label: "Paid", value: paidAmount, color: "bg-green-50 text-green-600", icon: "✅" },
              { label: "Unpaid", value: unpaidAmount, color: "bg-yellow-50 text-yellow-600", icon: "⏳" },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 flex items-center gap-4">
                <div className={`text-2xl w-12 h-12 flex items-center justify-center rounded-lg ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800">
                    KSh {card.value.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm">Click "New Invoice" to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Project</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Due Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((invoice, index) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-400">#{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{invoice.client_name}</td>
                    <td className="px-6 py-4 text-gray-500">{invoice.project_name || "—"}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      KSh {Number(invoice.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => openEdit(invoice)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
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
                {editInvoice ? "Edit Invoice" : "New Invoice"}
              </h2>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <select
                    name="client_id"
                    value={form.client_id}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    name="project_id"
                    value={form.project_id}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KSh)</label>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 15000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={form.due_date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
                  >
                    {editInvoice ? "Save Changes" : "Create Invoice"}
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

export default Invoices;