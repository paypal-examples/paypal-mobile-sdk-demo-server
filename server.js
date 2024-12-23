const express = require('express');
const PayPalSDK = require('@paypal/paypal-server-sdk');

const app = express();
const sdkClient = new PayPalSDK.Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: 'TODO: inject process.env.CLIENT_ID',
        oAuthClientSecret: 'TODO: inject process.env.CLIENT_SECRET'
    },
    environment: Environment.Sandbox,
});

app.get('/ping', (req, res) => {
    res.type('text/plain');
    res.send('pong')
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});