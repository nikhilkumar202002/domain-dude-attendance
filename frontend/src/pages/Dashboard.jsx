// src/pages/Dashboard.jsx
import { useState, useEffect, useContext } from 'react';
import { FiBriefcase, FiClock, FiCheckCircle, FiPlus, FiAlertCircle } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import API from '../utils/api';
import Layout from '../components/Layout';
import Modal from '../components/Modal'; // Ensure you created this component in the previous step

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    
    // --- States ---
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
    const [staffList, setStaffList] = useState([]);
    
    // Modal & Form States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', assignedTo: '', dueDate: '' });

    // --- Fetch Data & Calculate Stats ---
const fetchData = async () => {
        try {
            // 1. Get Tasks
            const taskRes = await API.get('/tasks');
            setTasks(taskRes.data);
            
            // 2. Calculate Stats
            const total = taskRes.data.length;
            const pending = taskRes.data.filter(t => t.status === 'Pending').length;
            const completed = taskRes.data.filter(t => t.status === 'Completed').length;
            setStats({ total, pending, completed });

            // 3. Get Staff (Flexible Check)
            // We check for "Team Lead" AND "TeamLead" just to be safe
            if (user && (user.role === 'CEO' || user.role === 'Team Lead' || user.role === 'TeamLead')) {
                const userRes = await API.get('/auth/users');
                setStaffList(userRes.data);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    // --- Handle Create Task ---
    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tasks', newTask);
            setIsTaskModalOpen(false); // Close popup
            setNewTask({ title: '', assignedTo: '', dueDate: '' }); // Reset form
            fetchData(); // Refresh table & stats
        } catch (err) {
            alert("Failed to create task");
        }
    };

    return (
        <Layout>
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Card: Total Tasks */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Tasks</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</h3>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                        <FiBriefcase className="w-6 h-6" />
                    </div>
                </div>

                {/* Card: Pending */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-yellow-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Pending</p>
                        <h3 className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                        <FiClock className="w-6 h-6" />
                    </div>
                </div>

                {/* Card: Completed */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500 flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Completed</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <FiCheckCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* --- 2. TASK TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FiBriefcase className="text-gray-400" /> Task List
                    </h2>
                    
                    {/* Only CEO/Team Lead can add tasks */}
                    {user && (user.role === 'CEO' || user.role === 'Team Lead' || user.role === 'TeamLead') && (
                        <button 
                            onClick={() => setIsTaskModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
                        >
                            <FiPlus className="w-4 h-4" /> Add New Task
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Task Title</th>
                                <th className="px-6 py-3">Assigned To</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tasks.length > 0 ? tasks.map((task) => (
                                <tr key={task._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-900">{task.title}</td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                            {task.assignedTo?.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        {task.assignedTo?.username || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center w-fit gap-1
                                            ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {task.status === 'Completed' ? <FiCheckCircle className="w-3 h-3"/> : <FiClock className="w-3 h-3"/>}
                                            {task.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-gray-400 italic flex flex-col items-center">
                                        <FiAlertCircle className="w-8 h-8 mb-2 opacity-50"/>
                                        No tasks found. Create one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- 3. CREATE TASK POPUP (MODAL) --- */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input type="text" required placeholder="e.g. Update Homepage" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <div className="relative">
                            <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white transition"
                                value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}>
                                <option value="">Select Staff Member</option>
                                {staffList.map(s => <option key={s._id} value={s._id}>{s.username}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md mt-2 flex justify-center items-center gap-2">
                        <FiPlus className="w-5 h-5" /> Confirm Assignment
                    </button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Dashboard;