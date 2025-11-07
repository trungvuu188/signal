import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import Header from "./Header";
import Login from "./Login";
import axios from "axios";

const API_BASE_INVITATION = "https://be.dev.familytree.io.vn/api/invitation";
const API_BASE_NOTIFICATION = "https://be.dev.familytree.io.vn/api/notifications";

export default function App() {
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hubUrl, setHubUrl] = useState("https://be.dev.familytree.io.vn/hubs/notification");
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🟢 Load stored notifications from DB
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(API_BASE_NOTIFICATION, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
        setNotificationCount(res.data.data.filter((n) => !n.isRead).length);
        console.log("Fetched stored notifications ✅");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Connect to SignalR hub
  const connectToHub = async () => {
    try {
      setConnectionStatus("Connecting...");

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem("token"),
        })
        .withAutomaticReconnect()
        .build();

      // 🔔 Receive notification
      newConnection.on("ReceiveNotification", (content) => {
        console.log("📨 Received notification:", content);
        addNotification({
          id: Date.now(),
          title: content.title || "Thông báo mới",
          message: content.message || content,
          type: content.type || 9003,
          isActionable: content.isActionable ?? false,
          createdAt: content.createdAt || new Date().toISOString(),
          relatedId: content.relatedId || null,
          isRead: false,
        });
      });

      await newConnection.start();
      setConnection(newConnection);
      setConnectionStatus("Connected");
      console.log("✅ Connected to SignalR hub");
    } catch (error) {
      setConnectionStatus("Connection Failed");
      console.error("❌ Connection error:", error.message);
    }
  };

  // 🔴 Disconnect
  const disconnect = async () => {
    if (connection) await connection.stop();
    setConnectionStatus("Disconnected");
    setConnection(null);
    console.log("🔴 Disconnected from SignalR hub");
  };

  // 📨 Add a notification
  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setNotificationCount((prev) => prev + 1);
  };

  // ✅ Handle Accept / Reject
  const handleRespond = async (relatedId, accepted) => {
    try {
      await axios.get(`${API_BASE_INVITATION}/respond`, {
        params: { relatedId, accepted },
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.relatedId === relatedId ? { ...n, isRead: true } : n
        )
      );

      setResponseMessage(
        accepted ? "✅ Bạn đã chấp nhận lời mời." : "❌ Bạn đã từ chối lời mời."
      );
    } catch (err) {
      console.error(err);
      setResponseMessage("⚠️ Có lỗi xảy ra khi phản hồi lời mời.");
    }
  };

  const handleBellClick = () => {
    setNotificationCount(0);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "Connected":
        return "text-green-600";
      case "Connecting...":
        return "text-yellow-600";
      case "Connection Failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    disconnect();
  };

  // 🧩 Auto connect & load notifications
  useEffect(() => {
    if (token) {
      fetchNotifications();
      if (!connection) connectToHub();
    }
    return () => {
      if (connection) connection.stop();
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header notificationCount={notificationCount} onBellClick={handleBellClick} />

      <div className="container mx-auto px-4 py-8">
        {!token ? (
          <div className="max-w-lg mx-auto">
            <Login onLogin={handleLogin} />
            <p className="mt-4 text-sm text-gray-600">
              Dev server proxies API calls to <code>/api</code> →{" "}
              <code>https://localhost:5001</code>.
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Sign out
              </button>
            </div>

            {/* Connection Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Connection Settings</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SignalR Hub URL
                </label>
                <input
                  type="text"
                  value={hubUrl}
                  onChange={(e) => setHubUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter SignalR hub URL"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={connectToHub}
                  disabled={
                    connectionStatus === "Connected" ||
                    connectionStatus === "Connecting..."
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Connect
                </button>
                <button
                  onClick={disconnect}
                  disabled={connectionStatus === "Disconnected"}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Disconnect
                </button>
                <span className={`font-medium ${getStatusColor()}`}>
                  Status: {connectionStatus}
                </span>
              </div>
            </div>

            {/* 🔔 Notifications Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">🔔 Thông báo của bạn</h2>

              {loading ? (
                <p className="text-gray-500">Đang tải thông báo...</p>
              ) : notifications.length === 0 ? (
                <p className="text-gray-500">Không có thông báo nào.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id || n.relatedId}
                    className="border p-3 mb-3 rounded shadow-sm bg-gray-50"
                  >
                    <h4 className="font-semibold text-gray-800 mb-1">{n.title}</h4>

                    {/* Render message as HTML */}
                    <div
                      className="text-gray-700 mb-2"
                      dangerouslySetInnerHTML={{ __html: n.message }}
                    />

                    <p className="text-xs text-gray-500 mb-2">
                      {n.createdOn || n.createdAt
                        ? new Date(n.createdOn || n.createdAt).toLocaleString("vi-VN")
                        : "Không rõ thời gian"}
                    </p>

                    {/* Accept / Reject */}
                    {n.isActionable && (n.type === 9003 || n.type === "INVITE") && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(n.relatedId, true)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(n.relatedId, false)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {responseMessage && (
                <div className="mt-3 p-2 bg-blue-100 border rounded text-blue-800">
                  {responseMessage}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
