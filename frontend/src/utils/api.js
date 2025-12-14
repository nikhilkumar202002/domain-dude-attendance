// src/utils/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api', // Your Backend URL
});

// Automatically add token to headers if it exists
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = token;
    }
    return req;
});

export default API;