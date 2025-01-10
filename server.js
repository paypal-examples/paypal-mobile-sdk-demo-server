const express = require('express');
const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

const app = express();
app.use(express.json());

const sdkClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.CLIENT_ID,
        oAuthClientSecret: process.env.CLIENT_SECRET
    },
    environment: Environment.Sandbox,
});

const ordersController = new OrdersController(sdkClient);

app.get('/ping', (req, res) => {
    res.type('text/plain');
    res.send('pong')
})

app.get('/client_id', async (req, res) => {
    const clientId = process.env.CLIENT_ID
    if (!clientId) {
        return res.status(400).send({
            error: 'Client ID is not found in environment'
        });
    }
    return res.status(200).send({ value: clientId })
});

app.get('/orders/:orderID', async (req, res, next) => {
    try {
        const response = await ordersController.ordersGet({
            id: req.params.orderID
        })
        res.status(200).send(response.body)
    } catch (err) {
        return res.status(400).send({ error: err.message });
    }
});

app.post('/orders/:orderID/capture', async (req, res) => {
    try {
        const response = await ordersController.ordersCapture({
            id: req.params.orderID,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        })
        res.status(200).send(response.body)
    } catch (err) {
        return res.status(400).send({ error: err.message });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const payload = {
            body: req.body,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        };
        const response = await ordersController.ordersCreate(payload);

        res.set('Content-Type', 'application/json');
        res.status(201).send(response.body);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
