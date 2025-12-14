// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks'; // <--- Import the new page
import Attendance from './pages/Attendance';
import Works from './pages/Works';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/tasks" element={<Tasks />} /> 
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/works" element={<Works />} />
        </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;