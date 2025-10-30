import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

// Header Component with Notification Bell
function Header({ notificationCount, onBellClick }) {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">SignalR Test App</h1>
        <button 
          onClick={onBellClick}
          className="relative p-2 hover:bg-blue-700 rounded-full transition-colors"
        >
          <Bell size={24} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;