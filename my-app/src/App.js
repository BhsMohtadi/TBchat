// WebhookButton.js
import React, { useState } from 'react';

const WebhookButton = () => {
    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleClick = () => {
        const payload = {
            // Your payload data here
            message: "Hello from the frontend!"
        };

        fetch('https://t-bchat-server.vercel.app/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setResponseMessage('Message sent successfully!');
        })
        .catch(error => {
            console.error('Error:', error);
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

export default WebhookButton;
