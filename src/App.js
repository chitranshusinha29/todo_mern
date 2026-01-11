import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // ---------- AUTH STATE ----------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // ---------- TODO STATE ----------
  const [task, setTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [todos, setTodos] = useState([]);
  const [editId, setEditId] = useState(null);

  // ---------- UI STATE ----------
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(localStorage.getItem("dark") === "true");

  const headers = {
    "Content-Type": "application/json",
    Authorization: token
  };

  // ---------- AUTH ----------
  const login = async () => {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else {
      alert(data.error);
    }
  };

  const register = async () => {
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    alert(data.message || data.error);
    setIsRegister(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ---------- FETCH TODOS ----------
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/todos", { headers })
      .then(res => res.json())
      .then(data => setTodos(data));
  }, [token]);

  // ---------- ADD / UPDATE TODO ----------
  const addOrUpdateTodo = async () => {
    if (!task.trim()) return;

    if (editId) {
      const res = await fetch(`http://localhost:5000/todos/${editId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ text: task, priority })
      });
      const updated = await res.json();
      setTodos(todos.map(t => t._id === editId ? updated : t));
      setEditId(null);
    } else {
      const res = await fetch("http://localhost:5000/todos", {
        method: "POST",
        headers,
        body: JSON.stringify({ text: task, priority })
      });
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
    }

    setTask("");
    setPriority("Medium");
  };

  // ---------- TOGGLE DONE ----------
  const toggleDone = async (id) => {
    const res = await fetch(`http://localhost:5000/todos/${id}`, {
      method: "PUT",
      headers
    });
    const updated = await res.json();
    setTodos(todos.map(t => t._id === id ? updated : t));
  };

  // ---------- DELETE ----------
  const deleteTodo = async (id) => {
    await fetch(`http://localhost:5000/todos/${id}`, {
      method: "DELETE",
      headers
    });
    setTodos(todos.filter(t => t._id !== id));
  };

  // ---------- DARK MODE ----------
  const toggleDark = () => {
    localStorage.setItem("dark", !dark);
    setDark(!dark);
  };

  // ---------- FILTER LOGIC ----------
  const visibleTodos = todos.filter(t => {
    const matchSearch = t.text.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "completed" && t.completed) ||
      (filter === "pending" && !t.completed);

    return matchSearch && matchFilter;
  });

  // ---------- LOGIN / REGISTER UI ----------
  if (!token) {
    return (
      <div className="login">
        <h2>{isRegister ? "Register" : "Login"}</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {isRegister ? (
          <>
            <button onClick={register}>Register</button>
            <p>
              Already have an account?{" "}
              <span onClick={() => setIsRegister(false)}>Login</span>
            </p>
          </>
        ) : (
          <>
            <button onClick={login}>Login</button>
            <p>
              New user?{" "}
              <span onClick={() => setIsRegister(true)}>Register Now</span>
            </p>
          </>
        )}
      </div>
    );
  }

  // ---------- MAIN TODO UI ----------
  return (
    <div className={`container ${dark ? "dark" : ""}`}>
      <div className="top">
        <h2>MERN Todo</h2>
        <button onClick={toggleDark}>{dark ? "☀️" : "🌙"}</button>
        <button className="logout" onClick={logout}>Logout</button>
      </div>

      <input
        placeholder="🔍 Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="filters">
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      <div className="input-box">
        <input
          value={task}
          placeholder="Enter task"
          onChange={e => setTask(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addOrUpdateTodo()}
        />

        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <button onClick={addOrUpdateTodo}>
          {editId ? "Update" : "Add"}
        </button>
      </div>

      <ul>
        {visibleTodos.map(t => (
          <li key={t._id} className={`${t.completed ? "done" : ""} ${t.priority}`}>
            <div className="left">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleDone(t._id)}
              />
              <span>{t.text}</span>
            </div>

            <div className="actions">
              <button onClick={() => {
                setTask(t.text);
                setPriority(t.priority);
                setEditId(t._id);
              }}>✏️</button>

              <button onClick={() => deleteTodo(t._id)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
