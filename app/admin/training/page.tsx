import React, { useState, useEffect } from "react";

type Module = {
  id: number;
  name: string;
};

type WorkerRequest = {
  id: number;
  name: string;
};

export default function AdminTrainingPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [workerRequests, setWorkerRequests] = useState<WorkerRequest[]>([]);
  const [newModule, setNewModule] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [modulesRes, workersRes] = await Promise.all([
          fetch("/api/modules"),
          fetch("/api/worker-requests"),
        ]);
        if (!modulesRes.ok || !workersRes.ok) throw new Error("Failed to fetch data");
        setModules(await modulesRes.json());
        setWorkerRequests(await workersRes.json());
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Create
  const handleAdd = async () => {
    if (!newModule.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newModule.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add module");
      const created = await res.json();
      setModules([...modules, created]);
      setNewModule("");
    } catch {
      setError("Could not add module.");
    } finally {
      setActionLoading(false);
    }
  };

  // Update
  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleUpdate = async () => {
    if (editingId === null || !editingName.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/modules/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });
      if (!res.ok) throw new Error("Failed to update module");
      setModules(modules.map(m =>
        m.id === editingId ? { ...m, name: editingName } : m
      ));
      setEditingId(null);
      setEditingName("");
    } catch {
      setError("Could not update module.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/modules/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete module");
      setModules(modules.filter(m => m.id !== id));
    } catch {
      setError("Could not delete module.");
    } finally {
      setActionLoading(false);
    }
  };

  // Accept/Deny worker requests
  const handleAccept = async (id: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/worker-requests/${id}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept request");
      setWorkerRequests(workerRequests.filter(w => w.id !== id));
    } catch {
      setError("Could not accept worker request.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async (id: number) => {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/worker-requests/${id}/deny`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to deny request");
      setWorkerRequests(workerRequests.filter(w => w.id !== id));
    } catch {
      setError("Could not deny worker request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Training Modules</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="mb-6">
        <input
          type="text"
          value={newModule}
          onChange={e => setNewModule(e.target.value)}
          placeholder="Add new module"
          className="border px-2 py-1 rounded mr-2"
          aria-label="Add new module"
          disabled={actionLoading}
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          disabled={!newModule.trim() || actionLoading}
          aria-label="Add module"
        >
          {actionLoading ? "Adding..." : "Add"}
        </button>
      </div>
      <ul className="mb-8">
        {modules.length === 0 ? (
          <li className="text-gray-500">No modules found.</li>
        ) : (
          modules.map(module => (
            <li key={module.id} className="flex items-center mb-2">
              {editingId === module.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="border px-2 py-1 rounded mr-2"
                    aria-label="Edit module name"
                    disabled={actionLoading}
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700"
                    disabled={!editingName.trim() || actionLoading}
                    aria-label="Save module"
                  >
                    {actionLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                    className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
                    disabled={actionLoading}
                    aria-label="Cancel edit"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{module.name}</span>
                  <button
                    onClick={() => handleEdit(module.id, module.name)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    disabled={actionLoading}
                    aria-label={`Edit ${module.name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    disabled={actionLoading}
                    aria-label={`Delete ${module.name}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </li>
          ))
        )}
      </ul>

      <h2 className="text-xl font-bold mb-4">Worker Requests</h2>
      <ul>
        {workerRequests.length === 0 ? (
          <li className="text-gray-500">No worker requests.</li>
        ) : (
          workerRequests.map(worker => (
            <li key={worker.id} className="flex items-center mb-2">
              <span className="flex-1">{worker.name}</span>
              <button
                onClick={() => handleAccept(worker.id)}
                className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700"
                disabled={actionLoading}
                aria-label={`Accept ${worker.name}`}
              >
                Accept
              </button>
              <button
                onClick={() => handleDeny(worker.id)}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                disabled={actionLoading}
                aria-label={`Deny ${worker.name}`}
              >
                Deny
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
