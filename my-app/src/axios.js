// src/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://t-bchat-server.vercel.app' : 'http://localhost:9000'
});

export default instance;
