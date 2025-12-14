// src/components/Header.jsx
import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext'; // <--- Import Socket Context
import { FiBell, FiUser, FiLogOut, FiChevronDown, FiX } from 'react-icons/fi';

const Header = () => {
    const { logout, user } = useContext(AuthContext);
    const { notifications, setNotifications } = useContext(SocketContext); // Get notifications
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const unreadCount = notifications.length;

    const clearNotifications = () => setNotifications([]);

    return (
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Overview</h2>

            <div className="flex items-center gap-6">
                
                {/* --- NOTIFICATION BELL --- */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative text-gray-400 hover:text-indigo-600 transition duration-200 focus:outline-none"
                    >
                        <FiBell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-700">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={clearNotifications} className="text-xs text-indigo-600 hover:text-indigo-800">
                                        Clear All
                                    </button>
                                )}
                            </div>
                            
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <p className="px-4 py-6 text-center text-sm text-gray-400">No new notifications</p>
                                ) : (
                                    notifications.map((notif, index) => (
                                        <div key={index} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 ${notif.type === 'success' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-indigo-500'}`}>
                                            <p className="text-sm text-gray-800 font-medium">{notif.message}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(notif.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- PROFILE DROPDOWN (Existing Code) --- */}
                <div className="relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 focus:outline-none group">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden sm:block group-hover:text-indigo-600 transition">
                            {user?.username}
                        </span>
                        <FiChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 z-50">
                            <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                <p className="text-xs text-gray-500 uppercase">Role</p>
                                <p className="text-sm font-semibold text-gray-800">{user?.role}</p>
                            </div>
                            <button onClick={logout} className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                <FiLogOut className="w-4 h-4" /> Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;