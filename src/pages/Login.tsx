import { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    //  Your verification logic here
    if (username === "admin" && password === "1234") {
      // Tell Electron login is successful
      window.api.loginSuccess();
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-80 p-6 rounded-lg bg-white shadow">
        <h2 className="text-lg font-semibold mb-4">Login</h2>

        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full py-2 bg-blue-600 text-white rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
