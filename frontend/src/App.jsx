import { useEffect, useState } from "react";
import axios from "axios";

/**
 * App - Main task management application component
 * Provides CRUD operations for tasks with error handling and loading states.
 * Communicates with Django REST API backend at http://127.0.0.1:8000/tasks/
 */
function App() {

  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Converts ISO timestamp to human-readable relative time string
   * Examples: "just now", "5mins ago", "2 days ago", "3mos ago"
   */
  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}min${mins !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}hr${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months}mo${months !== 1 ? 's' : ''} ago`;
  }

  /**
   * Fetches all tasks from the backend API
   * Sets loading state during request and handles errors gracefully
   */
  async function fetchTasks() {
    try {
      setError("");
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/tasks/");
      setTasks(res.data);
    } catch (err) {
      setError("Failed to fetch tasks. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Creates a new task on the backend
   * Validates input is not empty before sending
   * Clears input field on success
   */
  async function addTask() {
    if (task.trim() === "") return;

    try {
      setError("");
      setLoading(true);
      const res = await axios.post("http://127.0.0.1:8000/tasks/", {
        taskname: task,
        status: false
      });
      setTasks([...tasks, res.data]);
      setTask("");
    } catch (err) {
      setError("Failed to add task. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Deletes a task from the backend by ID
   * Removes the deleted task from the UI state
   */
  async function deleteTask(id) {
    try {
      setError("");
      setLoading(true);
      await axios.delete(`http://127.0.0.1:8000/tasks/${id}/`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError("Failed to delete task. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Toggles a task's completion status between complete and incomplete
   * Sends update to backend and reflects change in UI
   */
  async function toggleComplete(taskObj) {
    const updatedStatus = taskObj.status ? false : true;

    try {
      setError("");
      setLoading(true);
      const res = await axios.put(
        `http://127.0.0.1:8000/tasks/${taskObj.id}/`,
        {
          taskname: taskObj.taskname,
          status: updatedStatus
        }
      );
      setTasks(tasks.map(t => t.id === taskObj.id ? res.data : t));
    } catch (err) {
      setError("Failed to update task. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (

    <div className="min-h-screen bg-gray-900 text-white p-10">

      <div className="max-w-xl mx-auto">

        <h1 className="text-3xl font-bold mb-6 text-white">
          Task Board
        </h1>

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-100">
            {error}
          </div>
        )}

        {/* Add task */}

        <div className="flex gap-3 mb-6 items-center">

          <input
            className="border border-gray-700 bg-gray-800 text-white p-2 flex-1 rounded placeholder-gray-400"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Enter task"
          />

          <button
            onClick={addTask}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition"
          >
            {loading ? "Loading..." : "Add"}
          </button>

        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">
                {tasks.filter(t => t.status).length} of {tasks.length} completed
              </span>
              <span className="text-sm font-semibold text-blue-400">
                {Math.round((tasks.filter(t => t.status).length / tasks.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-300 ease-out hover:from-blue-400 hover:to-blue-300"
                style={{ width: `${(tasks.filter(t => t.status).length / tasks.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Task list */}
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No tasks yet. Add one to get started!
          </div>
        ) : (
          <>
            {tasks.map(t => (

              <div
                key={t.id}
                className={`flex justify-between items-center border border-gray-700 bg-gray-800 p-2 mb-2 rounded transition ${t.status ? 'opacity-50' : ''}`}
              >

                <div className="flex items-center gap-2">

                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500 disabled:cursor-not-allowed"
                    checked={t.status}
                    disabled={loading}
                    onChange={() => toggleComplete(t)}
                  />

                  <span className={t.status ? "line-through text-gray-500" : "text-white"}>
                    {t.taskname}
                  </span>

                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 hover:text-gray-300 transition" title={new Date(t.created_at).toLocaleString()}>
                    {formatTimeAgo(t.created_at)}
                  </span>

                  <button
                    onClick={() => deleteTask(t.id)}
                    disabled={loading}
                    className="text-red-400 hover:text-red-500 disabled:text-gray-600 disabled:cursor-not-allowed transition"
                  >
                    Delete
                  </button>
                </div>

              </div>

            ))}
          </>
        )}

      </div>

    </div>
  );
}

export default App;