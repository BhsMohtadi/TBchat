import axios from 'axios';

// Assuming the backend endpoint for sending messages is /api/messages
const API_URL = 'http://localhost:9000'; // Adjusted to localhost for local development

export const sendMessage = async (message) => {
    try {
        // Adjusted the endpoint to match the backend's expected path
        const response = await axios.post(`${API_URL}/api/messages`, { message });
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
