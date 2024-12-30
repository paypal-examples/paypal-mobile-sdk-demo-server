const express = require('express');
const { Client, Environment } = require('@paypal/paypal-server-sdk');

const app = express();
const sdkClient = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.CLIENT_ID,
        oAuthClientSecret: process.env.CLIENT_SECRET
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
