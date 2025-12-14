// src/context/SocketContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (user) {
            // Connect to Backend
            const newSocket = io('http://localhost:5000');
            setSocket(newSocket);

            // Identify user to the server
            newSocket.emit('join', user.id || user._id); // Ensure ID is correct based on your JWT payload

            // Listen for incoming notifications
            newSocket.on('notification', (notif) => {
                // Add new notification to the top of the list
                setNotifications((prev) => [notif, ...prev]);
                // Optional: Play a sound here
            });

            return () => newSocket.disconnect();
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;