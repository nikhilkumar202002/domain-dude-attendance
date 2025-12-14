// src/pages/Tasks.jsx
import { useState, useEffect, useContext } from 'react';
import { FiBriefcase, FiPlus, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import API from '../utils/api';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const Tasks = () => {
    const { user } = useContext(AuthContext);

    // Data States
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);

    // Modal & Form States
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', assignedTo: '', dueDate: '' });

    // --- Fetch Data ---
    const fetchData = async () => {
        try {
            const taskRes = await API.get('/tasks');
            setTasks(taskRes.data);

            // Fetch staff only if user has permission to assign
            if (user?.role === 'CEO' || user?.role === 'Team Lead') {
                const userRes = await API.get('/auth/users');
                setStaffList(userRes.data);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

useEffect(() => {
    const fetchData = async () => {
        try {
            const taskRes = await API.get('/tasks');
            setTasks(taskRes.data);

            // SAFETY CHECK HERE TOO
            if (user && (user.role === 'CEO' || user.role === 'Team Lead' || user.role === 'TeamLead')) {
                const userRes = await API.get('/auth/users');
                setStaffList(userRes.data);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };
    fetchData();
}, [user]); // Run whenever 'user' updates

    // --- Handle Create Task ---
    const handleCreateTask = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tasks', newTask);
            setIsTaskModalOpen(false);
            setNewTask({ title: '', assignedTo: '', dueDate: '' });
            fetchData(); // Refresh list
            alert("Task assigned successfully!");
        } catch (err) {
            alert("Failed to create task");
        }
    };

    return (
        <Layout>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FiBriefcase className="text-indigo-600" /> All Tasks
                    </h2>

                    {/* Add Button (CEO/Team Lead Only) */}
                  {user && (user.role === 'CEO' || user.role === 'Team Lead' || user.role === 'TeamLead') && (
                                <button 
                                    onClick={() => setIsTaskModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
                                >
                                    <FiPlus className="w-4 h-4" /> Assign New Task
                                </button>
                            )}
                </div>

                {/* Table */}
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
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
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
                                        No tasks found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- ADD TASK POPUP --- */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign New Task">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input type="text" required placeholder="e.g. Server Maintenance" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                        <select required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={newTask.assignedTo} onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}>
                            <option value="">Select Staff Member</option>
                            {staffList.map(s => <option key={s._id} value={s._id}>{s.username}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input type="date" required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium flex justify-center items-center gap-2">
                        <FiPlus className="w-5 h-5" /> Confirm Assignment
                    </button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Tasks;