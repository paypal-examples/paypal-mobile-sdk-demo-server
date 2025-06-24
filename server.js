const express = require('express');
const { Client, Environment, OrdersController, VaultController } = require('@paypal/paypal-server-sdk');

const app = express();
const path = require('path');
app.use(express.json());

const sdkClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.CLIENT_ID,
        oAuthClientSecret: process.env.CLIENT_SECRET
    },
    environment: Environment.Sandbox,
});

const ordersController = new OrdersController(sdkClient);
const vaultController = new VaultController(sdkClient);

app.get('/ping', (req, res) => {
    res.type('text/plain');
    res.send('pong')
})

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'), (err) => {
        if (err) {
            console.error('Error sending success.html:', err);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.get('/.well-known/apple-app-site-association', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'public', '.well-known', 'apple-app-site-association'));
});

app.use(express.static('public'));

app.get('/orders/:orderID', async (req, res) => {
    try {
        const response = await ordersController.getOrder({
            id: req.params.orderID
        })
        res.status(200).send(response.body)
    } catch (err) {
        console.log('Get Order Error');
        console.log(err.result.error_description);
        return res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/orders/:orderID/authorize', async (req, res) => {
    try {
        const response = await ordersController.authorizeOrder({
            id: req.params.orderID,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        })
        res.status(200).send(response.body)
    } catch (err) {
        console.log('Authorize Order Error');
        console.log(err.result.error_description);
        return res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/orders/:orderID/capture', async (req, res) => {
    try {
        const response = await ordersController.captureOrder({
            id: req.params.orderID,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        })
        res.status(200).send(response.body)
    } catch (err) {
        console.log('Capture Order Error');
        console.log(err.result.error_description);
        return res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const payload = {
            body: req.body,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        };
        const response = await ordersController.createOrder(payload);

        res.set('Content-Type', 'application/json');
        res.status(201).send(response.body);
    } catch (err) {
        console.log('Order Create Error');
        console.log(err.result.error_description);
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/payment_tokens', async (req, res) => {
    try {
        const payload = {
            body: req.body,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        };
        const response = await vaultController.createPaymentToken(payload);
        res.set('Content-Type', 'application/json');
        res.status(201).send(response.body);
    } catch (err) {
        console.log('Payment Token Create Error');
        console.log(err.result.error_description);
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/setup_tokens', async (req, res) => {
    try {
        const payload = {
            body: req.body,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        };
        const response = await vaultController.createSetupToken(payload);
        res.set('Content-Type', 'application/json');
        res.status(201).send(response.body);
    } catch (err) {
        console.log('Setup Token Create Error');
        console.log(err.result.error_description);
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.get('/setup-tokens/:setupTokenID', async (req, res) => {
    try {
        const { setupTokenID } = req.params;
        const response = await vaultController.getSetupToken(setupTokenID);
        res.set('Content-Type', 'application/json');
        res.status(201).send(response.body);
    } catch (err) {
        console.log('Setup Token Get Error');
        console.log(err.result.error_description);
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
