const express = require('express');
const { Client, Environment, OrdersController, VaultController } = require('@paypal/paypal-server-sdk');

const app = express();
const path = require('path');
app.use(express.json());

function errorAsJSON(err) {
    // pretty print
    return JSON.stringify(err, null, 2);
}

const {
    CLIENT_ID: oAuthClientId,
    CLIENT_SECRET: oAuthClientSecret,
    PAY_PAL_ENVIRONMENT: environment = Environment.Sandbox
} = process.env;
const clientCredentialsAuthCredentials = { oAuthClientId, oAuthClientSecret };
const sdkClient = new Client({ environment, clientCredentialsAuthCredentials });

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
        res.status(response.statusCode).send(response.body);
    } catch (err) {
        console.log('Get Order Error');
        console.log(errorAsJSON(err));
        return res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/orders/:orderID/authorize', async (req, res) => {
    try {
        const response = await ordersController.authorizeOrder({
            id: req.params.orderID,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        })
        res.status(response.statusCode).send(response.body);
    } catch (err) {
        console.log('Authorize Order Error');
        console.log(errorAsJSON(err));
        return res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/orders/:orderID/capture', async (req, res) => {
    try {
        const response = await ordersController.captureOrder({
            id: req.params.orderID,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        })
        res.status(response.statusCode).send(response.body);
    } catch (err) {
        console.log('Capture Order Error');
        console.log(errorAsJSON(err));
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
        res.status(response.statusCode).send(response.body);
    } catch (err) {
        console.log('Order Create Error');
        console.log(errorAsJSON(err));
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/payment-tokens', async (req, res) => {
    try {
        const payload = {
            body: req.body,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        };
        const response = await vaultController.createPaymentToken(payload);
        res.status(response.statusCode).send(response.body);
    } catch (err) {
        console.log('Payment Token Create Error');
        console.log(errorAsJSON(err));
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/setup-tokens', async (req, res) => {
    try {
        const payload = {
            body: req.body,
            paypalClientMetadataId: req.header('PayPal-Client-Metadata-Id')
        };
        const response = await vaultController.createSetupToken(payload);
        res.status(response.statusCode).send(response.body);
    } catch (err) {
        console.log('Setup Token Create Error');
        console.log(errorAsJSON(err));
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.get('/setup-tokens/:setupTokenID', async (req, res) => {
    try {
        const { setupTokenID } = req.params;
        const response = await vaultController.getSetupToken(setupTokenID);
        res.status(response.statusCode).send(response.body);
    } catch (err) {
        console.log('Setup Token Get Error');
        console.log(errorAsJSON(err));
        res.status(err.statusCode).send({ error: err.result.error_description });
    }
});

app.post('/client-tokens', async (req, res) => {
    try {
        const response = await sdkClient.clientCredentialsAuthManager.fetchToken();
        res.status(200).send({ clientToken: response });
    } catch (err) {
        console.log('Client Token Fetch Error');
        console.log(errorAsJSON(err));
        res.status(err.statusCode).send({ error: err });
    }
});

const { PORT: port = 3000 } = process.env;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
