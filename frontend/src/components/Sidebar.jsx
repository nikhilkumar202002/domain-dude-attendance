// src/components/Sidebar.jsx
import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
// 1. Import Icons
import { FiHome, FiLayers, FiCheckSquare, FiUsers, FiClock, FiLogOut, FiBriefcase } from 'react-icons/fi';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    // 2. Add 'icon' property to your menu config
    const menus = [
        { name: 'Dashboard', path: '/dashboard', icon: <FiHome />, roles: ['CEO', 'Team Lead', 'Staff'] },
        { name: 'All Tasks', path: '/tasks', icon: <FiLayers />, roles: ['CEO', 'Team Lead'] },
        { name: 'My Tasks', path: '/my-tasks', icon: <FiCheckSquare />, roles: ['Staff'] },
        { name: 'Employees', path: '/employees', icon: <FiUsers />, roles: ['CEO'] },
        { name: 'Works', path: '/works', icon: <FiBriefcase />, roles: ['CEO', 'Team Lead'] },
        { name: 'Attendance', path: '/attendance', icon: <FiClock />, roles: ['CEO', 'Staff'] },
    ];

    return (
        <div className="w-64 h-screen bg-gray-900 text-white fixed left-0 top-0 flex flex-col shadow-xl">
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <span className="text-xl font-bold tracking-wider flex items-center gap-2">
                    <FiLayers className="text-indigo-500" /> WORKFLOW
                </span>
            </div>

            <nav className="flex-1 px-3 py-6 space-y-2">
                {menus.map((item) => (
                    item.roles.includes(user?.role) && (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                location.pathname === item.path 
                                ? 'bg-indigo-600 text-white shadow-md' 
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            {/* 3. Render the Icon */}
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                ))}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                        {user?.role?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{user?.username || 'User'}</p>
                        <p className="text-xs text-gray-400">{user?.role}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;