import { useState } from "react";
import Header from "./Header";

export default function App() {

  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [messages, setMessages] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hubUrl, setHubUrl] = useState('https://your-signalr-hub-url/notifications');
  const [messageInput, setMessageInput] = useState('');

  const connectToHub = async () => {
    try {
      // Note: In a real Vite project, you would install @microsoft/signalr:
      // npm install @microsoft/signalr
      // import * as signalR from '@microsoft/signalr';
      
      setConnectionStatus('Connecting...');
      
      // Simulated connection for demo purposes
      // In real implementation, replace with:
      // const newConnection = new signalR.HubConnectionBuilder()
      //   .withUrl(hubUrl)
      //   .withAutomaticReconnect()
      //   .build();
      
      // await newConnection.start();
      // setConnection(newConnection);
      
      // Simulate successful connection
      setTimeout(() => {
        setConnectionStatus('Connected');
        addMessage('System', 'Connected to SignalR hub');
      }, 1000);
      
    } catch (error) {
      setConnectionStatus('Connection Failed');
      addMessage('System', `Connection error: ${error.message}`);
    }
  };

  const disconnect = () => {
    if (connection) {
      connection.stop();
    }
    setConnectionStatus('Disconnected');
    setConnection(null);
    addMessage('System', 'Disconnected from SignalR hub');
  };

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, newMessage]);
    if (sender !== 'System' && sender !== 'You') {
      setNotificationCount(prev => prev + 1);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    
    // In real implementation:
    // connection.invoke('SendMessage', messageInput);
    
    addMessage('You', messageInput);
    setMessageInput('');
    
    // Simulate receiving a response
    setTimeout(() => {
      addMessage('Server', `Echo: ${messageInput}`);
    }, 500);
  };

  const handleBellClick = () => {
    setNotificationCount(0);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'Connected': return 'text-green-600';
      case 'Connecting...': return 'text-yellow-600';
      case 'Connection Failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        notificationCount={notificationCount} 
        onBellClick={handleBellClick}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Connection Panel */}
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
              disabled={connectionStatus === 'Connected' || connectionStatus === 'Connecting...'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Connect
            </button>
            <button
              onClick={disconnect}
              disabled={connectionStatus === 'Disconnected'}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Disconnect
            </button>
            <span className={`font-medium ${getStatusColor()}`}>
              Status: {connectionStatus}
            </span>
          </div>
        </div>

        {/* Messages Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          
          <div className="border border-gray-300 rounded-md p-4 h-64 overflow-y-auto mb-4 bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-center">No messages yet</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className="mb-2 pb-2 border-b border-gray-200 last:border-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-blue-600">{msg.sender}</span>
                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-gray-800 mt-1">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Send Message */}
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={connectionStatus !== 'Connected'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Install SignalR client: <code className="bg-blue-100 px-1 rounded">npm install @microsoft/signalr</code></li>
            <li>Uncomment the SignalR code in the connectToHub function</li>
            <li>Replace the hub URL with your actual SignalR endpoint</li>
            <li>Set up event listeners for your hub methods</li>
          </ol>
        </div>
      </div>
    </div>
  );
}