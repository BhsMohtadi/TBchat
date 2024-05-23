// WebhookButton.js
import React, { useState } from 'react';
import axios from './axios';

const App = () => {
    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleClick = () => {
        const payload = {
            message: "Hello from the frontend!"
        };

        axios.post('/webhook', payload)
            .then(response => {
                setResponseMessage('Message sent successfully!');
            })
            .catch(error => {
                setErrorMessage('Failed to send message.');
            });
    };

    return (
        <div>
            <button onClick={handleClick}>Send Data to Webhook</button>
            {responseMessage && <div>{responseMessage}</div>}
            {errorMessage && <div>{errorMessage}</div>}
        </div>
    );
};

export default App;

