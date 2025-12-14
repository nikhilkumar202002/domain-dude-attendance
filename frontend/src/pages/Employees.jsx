// src/pages/Employees.jsx
import { useState, useEffect, useContext } from 'react';
import { FiUsers, FiPlus, FiCheckCircle, FiUpload, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import API from '../utils/api';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const Employees = () => {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState([]);
    
    // --- Modal States ---
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    // --- Data States ---
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null); 
    const [viewingUser, setViewingUser] = useState(null); 

    // --- Form State ---
    const [formData, setFormData] = useState({ username: '', password: '', role: 'Staff' });
    const [file, setFile] = useState(null);

    // --- 1. Fetch Employees ---
    const fetchEmployees = async () => {
        try {
            const res = await API.get('/auth/users');
            setEmployees(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => { fetchEmployees(); }, []);

    // --- HELPER: Construct Image URL Safely ---
    const getImageUrl = (path) => {
        if (!path) return null;
        // 1. Fix Windows Backslashes (replace \ with /)
        const cleanPath = path.replace(/\\/g, "/");
        // 2. Combine with Server URL
        return `http://localhost:5000/${cleanPath}`;
    };

    // --- 2. Handlers ---
    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', role: 'Staff' });
        setFile(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (emp) => {
        setEditingUser(emp);
        setFormData({ 
            username: emp.username, 
            password: '', 
            role: emp.role 
        });
        setFile(null);
        setIsFormModalOpen(true);
    };

    const openViewModal = (emp) => {
        setViewingUser(emp);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await API.delete(`/auth/users/${id}`);
                fetchEmployees(); 
            } catch (err) {
                alert("Failed to delete user.");
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 500 * 1024) {
                alert("File size exceeds 500KB!");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('username', formData.username);
        data.append('role', formData.role);
        if (formData.password) data.append('password', formData.password);
        if (file) data.append('profileImage', file);

        try {
            if (editingUser) {
                await API.put(`/auth/users/${editingUser._id}`, data);
                alert("User Updated Successfully!");
            } else {
                await API.post('/auth/register', data);
                alert("User Created Successfully!");
            }
            setIsFormModalOpen(false);
            fetchEmployees();
        } catch (err) {
            alert(err.response?.data?.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FiUsers className="text-indigo-600" /> Employee Management
                    </h2>
                    {(user?.role === 'CEO' || user?.role === 'Team Lead') && (
                        <button onClick={openCreateModal} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                            <FiPlus /> Add New Employee
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.length > 0 ? employees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        {/* IMAGE LOGIC FIX */}
                                        {emp.profileImage ? (
                                            <img 
                                                src={getImageUrl(emp.profileImage)} 
                                                className="w-10 h-10 rounded-full object-cover border border-gray-200" 
                                                alt={emp.username}
                                                // Fallback if image fails to load (e.g., file deleted from server)
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.style.display = 'none'; // Hide broken image
                                                    e.target.nextSibling.style.display = 'flex'; // Show initials div
                                                }}
                                            />
                                        ) : null}
                                        
                                        {/* Initials Fallback (Hidden if image loads) */}
                                        <div 
                                            className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm"
                                            style={{ display: emp.profileImage ? 'none' : 'flex' }} // Only show if no image
                                        >
                                            {emp.username.charAt(0).toUpperCase()}
                                        </div>

                                        <span className="font-medium text-gray-900">{emp.username}</span>
                                    </td>
                                    <td className="px-6 py-4">{emp.role}</td>
                                    <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-bold">Active</span></td>
                                    
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button onClick={() => openViewModal(emp)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                        {(user?.role === 'CEO' || user?.role === 'Team Lead') && (
                                            <>
                                                <button onClick={() => openEditModal(emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(emp._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-6">No employees found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CREATE / EDIT MODAL */}
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingUser ? "Edit Employee" : "Create New Employee"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" required className="w-full p-2 border rounded" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password {editingUser && <span className="text-xs text-gray-400">(Leave blank to keep current)</span>}</label>
                        <input type="password" className="w-full p-2 border rounded" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder={editingUser ? "********" : "Required"} required={!editingUser} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select className="w-full p-2 border rounded bg-white" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                            <option value="Staff">Staff</option>
                            <option value="Team Lead">Team Lead</option>
                            <option value="CEO">CEO</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border border-dashed rounded" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                        {loading ? 'Processing...' : (editingUser ? 'Update Employee' : 'Create Employee')}
                    </button>
                </form>
            </Modal>

            {/* VIEW MODAL */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Employee Details">
                {viewingUser && (
                    <div className="flex flex-col items-center p-4">
                        {viewingUser.profileImage ? (
                            <img src={getImageUrl(viewingUser.profileImage)} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-4" alt="" />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-600 mb-4">{viewingUser.username.charAt(0)}</div>
                        )}
                        <h3 className="text-xl font-bold text-gray-800">{viewingUser.username}</h3>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mt-2">{viewingUser.role}</span>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default Employees;