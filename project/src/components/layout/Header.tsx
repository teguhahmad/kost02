import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell } from 'lucide-react';
import Button from '../ui/Button';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onNavigate }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [notifications] = useState([
    {
      id: 1,
      message: "Pembayaran baru diterima",
      time: "5 menit yang lalu"
    },
    {
      id: 2,
      message: "Permintaan pemeliharaan selesai",
      time: "1 jam yang lalu"
    },
    {
      id: 3,
      message: "Penyewa baru check-in",
      time: "2 jam yang lalu"
    }
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    if (onNavigate) {
      onNavigate('notifications');
    }
  };

  return (
    <header className="bg-white shadow-sm h-16 flex items-center fixed top-0 right-0 left-64 z-20 px-6">
      <div className="flex-1 flex items-center">
        <button onClick={onMenuClick} className="lg:hidden mr-4 text-gray-500 focus:outline-none">
          <Menu size={24} />
        </button>
        
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative" ref={notificationsRef}>
          <button 
            className="relative text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Notifikasi</h3>
              </div>
              {notifications.map(notification => (
                <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                  <p className="text-sm text-gray-800">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))}
              <div className="px-4 py-2 border-t border-gray-100">
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={handleViewAllNotifications}
                >
                  Lihat semua notifikasi
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            A
          </div>
          <span className="text-sm font-medium text-gray-700 hidden md:inline-block">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;