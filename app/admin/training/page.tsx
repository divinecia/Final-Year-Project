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

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const modulesRes = await fetch("/api/modules");
      const workersRes = await fetch("/api/worker-requests");
      setModules(await modulesRes.json());
      setWorkerRequests(await workersRes.json());
      setLoading(false);
    }
    fetchData();
  }, []);

  // Create
  const handleAdd = async () => {
    if (newModule.trim()) {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newModule.trim() }),
      });
      const created = await res.json();
      setModules([...modules, created]);
      setNewModule("");
    }
  };

  // Update
  const handleEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleUpdate = async () => {
    if (editingId !== null) {
      await fetch(`/api/modules/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });
      setModules(modules.map(m =>
        m.id === editingId ? { ...m, name: editingName } : m
      ));
      setEditingId(null);
      setEditingName("");
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    await fetch(`/api/modules/${id}`, { method: "DELETE" });
    setModules(modules.filter(m => m.id !== id));
  };

  // Accept/Deny worker requests
  const handleAccept = async (id: number) => {
    await fetch(`/api/worker-requests/${id}/accept`, { method: "POST" });
    setWorkerRequests(workerRequests.filter(w => w.id !== id));
  };

  const handleDeny = async (id: number) => {
    await fetch(`/api/worker-requests/${id}/deny`, { method: "POST" });
    setWorkerRequests(workerRequests.filter(w => w.id !== id));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Training Modules</h2>
      <div className="mb-6">
        <input
          type="text"
          value={newModule}
          onChange={e => setNewModule(e.target.value)}
          placeholder="Add new module"
          className="border px-2 py-1 rounded mr-2"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          disabled={!newModule.trim()}
        >
          Add
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
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-green-600 text-white px-2 py-1 rounded mr-2 hover:bg-green-700"
                    disabled={!editingName.trim()}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingName("");
                    }}
                    className="bg-gray-300 px-2 py-1 rounded hover:bg-gray-400"
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
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(module.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
              >
                Accept
              </button>
              <button
                onClick={() => handleDeny(worker.id)}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
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
