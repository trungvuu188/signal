import { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      // Backend controller expects a LoginRequest with Username and Password
      const payload = {
        Username: email,
        Password: password
      };

      console.debug('Login request payload:', payload);

      const res = await fetch('https://be.dev.familytree.io.vn/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const raw = await res.text();
      console.debug('Login response status:', res.status, 'raw body:', raw);

      let data = null;
      try { data = JSON.parse(raw); } catch { data = null; }

      // backend returns non-2xx when ModelState invalid or on exceptions
      if (!res.ok) {
        const msg = (data && (data.message || data.error || JSON.stringify(data))) || raw || `Request failed with status ${res.status}`;
        setError(msg);
        setLoading(false);
        return;
      }

      // backend success -> try to find token (search recursively)
      data = data || {};

      const findToken = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        const keys = Object.keys(obj);
        for (const k of keys) {
          const v = obj[k];
          if (k === 'token' || k === 'accessToken' || k === 'access_token') return v;
          if (typeof v === 'object') {
            const nested = findToken(v);
            if (nested) return nested;
          }
        }
        return null;
      };

      const token = findToken(data);
      if (!token) {
        // If there's an informative message in the wrapper, show it
        const serverMessage = data.message || data.error || (data.result && (data.result.message || data.result.error));
        setError(serverMessage || 'Login succeeded but no token was returned by the API. Raw response: ' + raw);
        setLoading(false);
        return;
      }

      // Persist token and notify parent
      localStorage.setItem('token', token);
      if (typeof onLogin === 'function') onLogin(token);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-100 p-2 rounded">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
