import axios from 'axios';

const API_URL = 'https://b775-196-179-179-223.ngrok-free.app';

export const sendMessage = async (message) => {
    try {
        const response = await axios.post(`${API_URL}/webhook`, { message });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

