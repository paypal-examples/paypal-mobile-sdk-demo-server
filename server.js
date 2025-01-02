const express = require('express');
const { Client, Environment, OrdersController } = require('@paypal/paypal-server-sdk');

const app = express();
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

app.get('/orders/:orderID', async (req, res, next) => {
    try {
        const response = await ordersController.ordersGet({
            id: req.params.orderID
        })
        res.json(response.body)
    } catch  (err) {
        next(err)
    }
});

app.post('/orders/:orderID/capture', async (req, res, next) => {
    try {
        const response = await ordersController.ordersCapture({
            id: req.params.orderID,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        })
        res.json(response.body)
    } catch  (err) {
        next(err)
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
