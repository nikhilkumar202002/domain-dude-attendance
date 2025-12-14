// src/pages/Attendance.jsx
import { useState, useEffect, useContext } from 'react';
import { FiClock, FiCalendar, FiCheckCircle, FiUser, FiMapPin } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import API from '../utils/api';
import Layout from '../components/Layout';

const Attendance = () => {
    const { user } = useContext(AuthContext);

    // --- State ---
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alreadyMarked, setAlreadyMarked] = useState(false);

    // --- Fetch Attendance Logs ---
    const fetchAttendance = async () => {
        try {
            // GET /attendance should return logs based on role:
            // - Staff: Returns only their own logs
            // - CEO: Returns logs for ALL users
            const res = await API.get('/attendance');
            setLogs(res.data);

            // Check if user already marked attendance today
            const today = new Date().toISOString().split('T')[0];
            const hasMarked = res.data.some(log => 
                log.userId === user?.id && // Assuming log has userId
                new Date(log.date).toISOString().split('T')[0] === today
            );
            if (hasMarked) setAlreadyMarked(true);

        } catch (err) {
            console.error("Error fetching attendance", err);
        }
    };

    useEffect(() => { fetchAttendance(); }, [user]);

    // --- Handle Mark Attendance ---
    const handleMarkAttendance = async () => {
        setLoading(true);
        try {
            // POST /attendance creates a new record for "today"
            await API.post('/attendance', { status: 'Present' });
            alert("Attendance marked successfully!");
            setAlreadyMarked(true);
            fetchAttendance(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark attendance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                
                {/* --- Header Section --- */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FiCalendar className="text-indigo-600" /> Attendance Records
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Track daily check-ins and logs</p>
                    </div>

                    {/* Mark Attendance Button (Visible to everyone) */}
                    <button 
                        onClick={handleMarkAttendance}
                        disabled={alreadyMarked || loading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm
                            ${alreadyMarked 
                                ? 'bg-green-100 text-green-700 cursor-not-allowed border border-green-200' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                    >
                        {alreadyMarked ? (
                            <><FiCheckCircle className="w-4 h-4" /> Checked In Today</>
                        ) : (
                            <><FiClock className="w-4 h-4" /> {loading ? 'Marking...' : 'Mark Attendance'}</>
                        )}
                    </button>
                </div>

                {/* --- Attendance Table --- */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                {/* Show Employee Name only if CEO/Team Lead */}
                                {(user?.role === 'CEO' || user?.role === 'Team Lead') && (
                                    <th className="px-6 py-3">Employee</th>
                                )}
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Time In</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {logs.length > 0 ? logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50 transition">
                                    {/* Date */}
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {new Date(log.date).toLocaleDateString()}
                                    </td>

                                    {/* Employee Name (Admin View) */}
                                    {(user?.role === 'CEO' || user?.role === 'Team Lead') && (
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-bold">
                                                <FiUser />
                                            </div>
                                            {log.userId?.username || 'Unknown'}
                                        </td>
                                    )}

                                    {/* Status Badge */}
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                                            ${log.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Present' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            {log.status}
                                        </span>
                                    </td>

                                    {/* Time */}
                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                        {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-400 italic">
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Attendance;