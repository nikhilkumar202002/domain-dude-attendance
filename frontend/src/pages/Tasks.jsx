// src/pages/Tasks.jsx
import { useState, useEffect, useContext } from 'react';
import { FiBriefcase, FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiSquare, FiCheckSquare, FiTag } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import API from '../utils/api';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const Tasks = () => {
    const { user } = useContext(AuthContext);

    // --- States ---
    const [tasks, setTasks] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    const [editingTask, setEditingTask] = useState(null);
    const [viewingTask, setViewingTask] = useState(null);

    // Form Data
    const [taskData, setTaskData] = useState({ 
        title: '', 
        subCategory: '', 
        description: '', 
        assignedTo: '', 
        dueDate: '', 
        status: 'Pending',
        subtasks: [] 
    });
    
    const [tempSubtask, setTempSubtask] = useState("");

    // --- 1. Fetch Data ---
    const fetchData = async () => {
        try {
            const taskRes = await API.get('/tasks');
            setTasks(taskRes.data);

            if (user && (user.role === 'CEO' || user.role === 'Team Lead' || user.role === 'TeamLead')) {
                const userRes = await API.get('/auth/users');
                setStaffList(userRes.data);
            }
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    useEffect(() => { fetchData(); }, [user]);

    // --- 2. Subtask Handlers ---
    const addSubtask = () => {
        if (!tempSubtask.trim()) return;
        setTaskData({
            ...taskData,
            subtasks: [...taskData.subtasks, { title: tempSubtask, isCompleted: false }]
        });
        setTempSubtask("");
    };

    const removeSubtask = (index) => {
        const updated = [...taskData.subtasks];
        updated.splice(index, 1);
        setTaskData({ ...taskData, subtasks: updated });
    };

    // NEW: Toggle Subtask Status in Edit View
    const toggleSubtask = (index) => {
        const updated = [...taskData.subtasks];
        updated[index].isCompleted = !updated[index].isCompleted;
        setTaskData({ ...taskData, subtasks: updated });
    };

    // --- 3. Modal Handlers ---
    const openCreateModal = () => {
        setEditingTask(null);
        setTaskData({ title: '', subCategory: '', description: '', assignedTo: '', dueDate: '', status: 'Pending', subtasks: [] });
        setIsFormModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setTaskData({ 
            title: task.title, 
            subCategory: task.subCategory || '', 
            description: task.description || '',
            assignedTo: task.assignedTo?._id || '', 
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', 
            status: task.status,
            subtasks: task.subtasks || []
        });
        setIsFormModalOpen(true);
    };

    const openViewModal = (task) => {
        setViewingTask(task);
        setIsViewModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingTask) {
                await API.put(`/tasks/${editingTask._id}`, taskData);
                alert("Task updated successfully!");
            } else {
                await API.post('/tasks', taskData);
                alert("Task assigned successfully!");
            }
            setIsFormModalOpen(false);
            fetchData();
        } catch (err) {
            alert("Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this task?")) {
            try {
                await API.delete(`/tasks/${id}`);
                fetchData();
            } catch (err) { alert("Failed to delete task."); }
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await API.put(`/tasks/${task._id}`, { status: newStatus });
            fetchData();
        } catch (err) { alert("Failed to update status"); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Correction': return 'bg-red-100 text-red-800';
            case 'Work Started': return 'bg-indigo-100 text-indigo-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const canEdit = user?.role === 'CEO' || user?.role === 'Team Lead' || user?.role === 'TeamLead';

    return (
        <Layout>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FiBriefcase className="text-indigo-600" /> All Tasks
                    </h2>
                    {canEdit && (
                        <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                            <FiPlus /> Assign New Task
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Task Title</th>
                                <th className="px-6 py-3">Sub Category</th>
                                <th className="px-6 py-3">Assigned To</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {tasks.length > 0 ? tasks.map((task) => (
                                <tr key={task._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{task.title}</div>
                                        <div className="text-xs text-gray-400 mt-1">{task.subtasks?.length || 0} Subtasks</div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        {task.subCategory ? (
                                            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-600 px-2 py-1 rounded border">
                                                <FiTag className="w-3 h-3" /> {task.subCategory}
                                            </span>
                                        ) : '-'}
                                    </td>

                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                            {task.assignedTo?.username?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        {task.assignedTo?.username || 'Unassigned'}
                                    </td>
                                    <td className="px-6 py-4">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                                    
                                    <td className="px-6 py-4">
                                        <select 
                                            value={task.status} 
                                            onChange={(e) => handleStatusChange(task, e.target.value)}
                                            className={`px-2 py-1 rounded-full text-xs font-semibold border-none outline-none cursor-pointer text-center w-28 ${getStatusColor(task.status)}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Work Started">Work Started</option>
                                            <option value="Correction">Correction</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => openViewModal(task)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"><FiEye /></button>
                                        {canEdit && (
                                            <>
                                                <button onClick={() => openEditModal(task)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"><FiEdit2 /></button>
                                                <button onClick={() => handleDelete(task._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full"><FiTrash2 /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="text-center py-10 text-gray-400">No tasks found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- CREATE / EDIT MODAL --- */}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingTask ? "Edit Task Details" : "Assign New Task"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" required placeholder="Task Title" className="w-full p-2.5 border rounded"
                            value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})} />
                        
                        <input type="text" placeholder="Sub Category (e.g. Design)" className="w-full p-2.5 border rounded"
                            value={taskData.subCategory} onChange={(e) => setTaskData({...taskData, subCategory: e.target.value})} />
                    </div>

                    <textarea placeholder="Description (Optional)" className="w-full p-2.5 border rounded" rows="2"
                        value={taskData.description} onChange={(e) => setTaskData({...taskData, description: e.target.value})}></textarea>
                    
                    {/* UPDATED Subtasks Section */}
                    <div className="bg-gray-50 p-3 rounded-lg border">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Subtasks (Checklist)</label>
                        
                        {/* List of Subtasks with Checkboxes */}
                        <ul className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {taskData.subtasks.map((sub, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-white p-2.5 rounded border shadow-sm">
                                    <div className="flex items-center gap-3">
                                        {/* Checkbox to toggle status */}
                                        <button 
                                            type="button" 
                                            onClick={() => toggleSubtask(idx)}
                                            className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition
                                                ${sub.isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300'}`}
                                        >
                                            {sub.isCompleted && <FiCheckSquare className="w-3.5 h-3.5" />}
                                        </button>
                                        
                                        {/* Text (Strikethrough if completed) */}
                                        <span className={`text-sm ${sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                            {sub.title}
                                        </span>
                                    </div>

                                    {/* Delete Button */}
                                    <button type="button" onClick={() => removeSubtask(idx)} className="text-red-400 hover:text-red-600">
                                        <FiX />
                                    </button>
                                </li>
                            ))}
                            {taskData.subtasks.length === 0 && <p className="text-xs text-gray-400 italic">No subtasks added yet.</p>}
                        </ul>

                        {/* Add New Subtask Input */}
                        <div className="flex gap-2">
                            <input type="text" placeholder="Add new item..." className="w-full p-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                value={tempSubtask} onChange={(e) => setTempSubtask(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())} />
                            <button type="button" onClick={addSubtask} className="bg-gray-800 text-white px-3 py-2 rounded text-sm hover:bg-gray-900">Add</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {canEdit && (
                            <select className="w-full p-2.5 border rounded"
                                value={taskData.assignedTo} onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}>
                                <option value="">Assign To...</option>
                                {staffList.map(s => <option key={s._id} value={s._id}>{s.username}</option>)}
                            </select>
                        )}
                        <input type="date" className="w-full p-2.5 border rounded"
                            value={taskData.dueDate} onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})} />
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded hover:bg-indigo-700">
                        {loading ? 'Saving...' : 'Save Task'}
                    </button>
                </form>
            </Modal>

            {/* --- VIEW MODAL --- */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Task Details">
                {viewingTask && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded border">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-gray-900">{viewingTask.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${getStatusColor(viewingTask.status)}`}>
                                    {viewingTask.status}
                                </span>
                            </div>
                            {viewingTask.subCategory && (
                                <span className="inline-block mt-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                                    {viewingTask.subCategory}
                                </span>
                            )}
                            {viewingTask.description && <p className="text-sm text-gray-600 mt-3">{viewingTask.description}</p>}
                        </div>

                        {/* View Subtasks */}
                        {viewingTask.subtasks && viewingTask.subtasks.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 mb-2">Subtasks</h4>
                                <ul className="space-y-2">
                                    {viewingTask.subtasks.map((sub, index) => (
                                        <li key={index} className="flex items-center gap-3 p-2 border rounded bg-white">
                                            {sub.isCompleted ? (
                                                <FiCheckSquare className="text-indigo-600 w-5 h-5" />
                                            ) : (
                                                <FiSquare className="text-gray-400 w-5 h-5" />
                                            )}
                                            <span className={`text-sm ${sub.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                {sub.title}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="text-xs text-gray-400 border-t pt-2">
                            Assigned to: {viewingTask.assignedTo?.username}
                        </div>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default Tasks;