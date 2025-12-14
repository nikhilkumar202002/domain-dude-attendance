// src/pages/Works.jsx
import { useState, useEffect, useContext } from 'react';
import { FiBriefcase, FiPlus, FiTrash2, FiEdit3, FiFilter } from 'react-icons/fi';
import API from '../utils/api';
import Layout from '../components/Layout';
import Modal from '../components/Modal';

const Works = () => {
    // --- States ---
    const [works, setWorks] = useState([]);
    const [filteredWorks, setFilteredWorks] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        clientName: '', companyName: '', scope: '', technology: '',
        description: '', price: '', startDate: '', endDate: '', status: 'Proposal Given'
    });

    // --- Fetch Works ---
    const fetchWorks = async () => {
        try {
            const res = await API.get('/works');
            setWorks(res.data);
            filterData(res.data, activeTab);
        } catch (err) {
            console.error("Error fetching works", err);
        }
    };

    useEffect(() => { fetchWorks(); }, []);

    // --- Tab Filter Logic ---
    const filterData = (data, status) => {
        if (status === 'All') {
            setFilteredWorks(data);
        } else {
            setFilteredWorks(data.filter(work => work.status === status));
        }
    };

    const handleTabChange = (status) => {
        setActiveTab(status);
        filterData(works, status);
    };

    // --- Handlers ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/works', formData);
            setIsModalOpen(false);
            setFormData({ clientName: '', companyName: '', scope: '', technology: '', description: '', price: '', startDate: '', endDate: '', status: 'Proposal Given' });
            fetchWorks();
            alert("Work added successfully!");
        } catch (err) {
            alert("Failed to add work.");
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await API.put(`/works/${id}`, { status: newStatus });
            fetchWorks(); // Refresh UI
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                await API.delete(`/works/${id}`);
                fetchWorks();
            } catch (err) {
                alert("Failed to delete");
            }
        }
    };

    return (
        <Layout>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FiBriefcase className="text-indigo-600" /> Client Works
                    </h2>
                    <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2">
                        <FiPlus /> Add New Work
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6 space-x-6 mt-2">
                    {['All', 'Proposal Given', 'Need to Start', 'Ongoing', 'Completed'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab 
                                ? 'border-indigo-600 text-indigo-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-3">Client / Company</th>
                                <th className="px-6 py-3">Scope & Tech</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Timeline</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredWorks.map((work) => (
                                <tr key={work._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{work.clientName}</div>
                                        <div className="text-xs text-gray-500">{work.companyName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900 font-medium">{work.scope}</div>
                                        <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-1 rounded mt-1">{work.technology}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-gray-700">
                                        ${work.price?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        <div>S: {new Date(work.startDate).toLocaleDateString()}</div>
                                        <div>E: {new Date(work.endDate).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select 
                                            value={work.status} 
                                            onChange={(e) => handleStatusChange(work._id, e.target.value)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-full border-none outline-none cursor-pointer
                                                ${work.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                                  work.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                                                  work.status === 'Need to Start' ? 'bg-orange-100 text-orange-800' :
                                                  'bg-gray-100 text-gray-800'}`}
                                        >
                                            <option value="Proposal Given">Proposal Given</option>
                                            <option value="Need to Start">Need to Start</option>
                                            <option value="Ongoing">Ongoing</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDelete(work._id)} className="text-red-500 hover:text-red-700 p-1">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredWorks.length === 0 && <div className="text-center py-10 text-gray-400">No works found in this category.</div>}
                </div>
            </div>

            {/* Create Work Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="border p-2 rounded" placeholder="Client Name" required value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} />
                    <input className="border p-2 rounded" placeholder="Company Name" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                    
                    <input className="border p-2 rounded md:col-span-2" placeholder="Scope of Work" required value={formData.scope} onChange={e => setFormData({...formData, scope: e.target.value})} />
                    
                    <input className="border p-2 rounded" placeholder="Technology (e.g. React)" value={formData.technology} onChange={e => setFormData({...formData, technology: e.target.value})} />
                    <input className="border p-2 rounded" type="number" placeholder="Price" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    
                    <div className="md:col-span-2">
                        <label className="text-xs text-gray-500">Submission Dates (Start - End)</label>
                        <div className="flex gap-2">
                            <input className="border p-2 rounded w-full" type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                            <input className="border p-2 rounded w-full" type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                        </div>
                    </div>
                    
                    <textarea className="border p-2 rounded md:col-span-2" placeholder="Description" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    
                    <div className="md:col-span-2">
                        <label className="text-xs text-gray-500">Initial Status</label>
                        <select className="border p-2 rounded w-full" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option value="Proposal Given">Proposal Given</option>
                            <option value="Need to Start">Need to Start</option>
                            <option value="Ongoing">Ongoing</option>
                        </select>
                    </div>

                    <button type="submit" className="bg-indigo-600 text-white p-2 rounded col-span-2 hover:bg-indigo-700">Save Project</button>
                </form>
            </Modal>
        </Layout>
    );
};

export default Works;