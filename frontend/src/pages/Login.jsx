// src/pages/Login.jsx
import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import API from '../utils/api';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post('/auth/login', form);
            login(data.token); // Save token and redirect
        } catch (err) {
            setError("Invalid Credentials");
        }
    };

    return (
        <div style={{ padding: '50px' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input 
                    name="username" 
                    placeholder="Username" 
                    onChange={handleChange} 
                    required 
                    style={{ display: 'block', margin: '10px 0', padding: '8px' }}
                />
                <input 
                    name="password" 
                    type="password" 
                    placeholder="Password" 
                    onChange={handleChange} 
                    required 
                    style={{ display: 'block', margin: '10px 0', padding: '8px' }}
                />
                <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
            </form>
        </div>
    );
};

export default Login;