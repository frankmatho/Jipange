import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: "👥", title: "Client Management", desc: "Keep all your client info organized in one place." },
    { icon: "📁", title: "Project Tracking", desc: "Monitor project status, deadlines and progress." },
    { icon: "✅", title: "Task Management", desc: "Break projects into tasks and track completion." },
    { icon: "🧾", title: "Invoicing", desc: "Create invoices and track payments effortlessly." },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Jipange</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1 rounded-full mb-6 uppercase tracking-widest">
          Client & Project Management
        </span>
        <h2 className="text-5xl font-extrabold leading-tight max-w-3xl mb-6">
          Manage your clients &{" "}
          <span className="text-blue-500">projects</span>{" "}
          with ease
        </h2>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          Jipange helps freelancers and small teams stay on top of their clients,
          projects, tasks and invoices — all in one clean dashboard.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
          >
            Get Started for Free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition text-sm"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24">
        <h3 className="text-center text-2xl font-bold mb-12 text-white">
          Everything you need in one place
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800 px-8 py-20 text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to get organized?</h3>
        <p className="text-gray-400 mb-8">
          Join Jipange today and take control of your workflow.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          Create Free Account
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Jipange. Built for freelancers & small teams.
      </footer>
    </div>
  );
};

export default Landing;