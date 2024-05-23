const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 9000;

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

app.use(bodyParser.json());

// Facebook Webhook verification
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
    }
});

// Webhook endpoint to receive messages
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

// WhatsApp Webhook endpoint to receive messages
app.post('/whatsapp-webhook', (req, res) => {
    const body = req.body;
    console.log('Received WhatsApp webhook:', body);

    res.status(200).send('EVENT_RECEIVED');
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
        uri: 'https://graph.facebook.com/v12.0/me/messages',
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});