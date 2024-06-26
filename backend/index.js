const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Set up SSL
const options = {
    key: fs.readFileSync('./ssl-certs/server.key'), // Path to your SSL key
    cert: fs.readFileSync('./ssl-certs/server.crt') // Path to your SSL certificate
};

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://t-bchat-frontend.vercel.app'); // Replace with your frontend URL
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const corsOptions = {
    origin: 'https://t-bchat-frontend.vercel.app' // Replace with your frontend URL
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.options('*', cors());

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

app.post('/webhook', (req, res) => {
    const body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const webhook_event = entry.messaging[0];
            console.log('Received webhook event:', webhook_event);

            const sender_psid = webhook_event.sender.id;
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

function handleMessage(sender_psid, received_message) {
    let response;

    if (received_message.text) {
        response = {
            'text': `You sent the message: "${received_message.text}". Now send me an image!`
        };
    } else if (received_message.attachments) {
        response = {
            'text': 'Sorry, I can only process text messages for now.'
        };
    }

    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    let response;

    const payload = received_postback.payload;

    if (payload === 'yes') {
        response = { 'text': 'Thanks!' };
    } else if (payload === 'no') {
        response = { 'text': 'Oops, try sending another message.' };
    }

    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    const request_body = {
        'recipient': {
            'id': sender_psid
        },
        'message': response
    };

    request({
        uri: 'https://graph.facebook.com/v20.0/me/messages',
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('Message sent!');
        } else {
            console.error('Unable to send message:' + err);
        }
    });
}

// Create HTTPS server
https.createServer(options, app).listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
