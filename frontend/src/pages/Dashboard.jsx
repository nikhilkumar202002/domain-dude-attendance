// src/pages/Dashboard.jsx
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ padding: '50px' }}>
            <h1>Dashboard</h1>
            {user && <h2>Welcome, {user.role}!</h2>}
            
            {user?.role === 'CEO' && <p>You have full access.</p>}
            {user?.role === 'Staff' && <p>View your assigned tasks here.</p>}
            
            <button onClick={logout} style={{ marginTop: '20px', padding: '10px' }}>Logout</button>
        </div>
    );
};

export default Dashboard;