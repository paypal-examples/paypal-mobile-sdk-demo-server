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


app.post('/orders', async (req, res) => {
    try {
	const { intent, purchaseUnits } = req.body;

	if (!intent || !purchaseUnits || !Array.isArray(purchaseUnits) || purchaseUnits.length == 0) {
	return res.status(400).send({ 
	error: 'Invalid request body.',
	 });
	}

	const orderRequest = { 
	intent, 
	purchaseUnits: purchaseUnits.map((unit) => ({
	amount: {
		currencyCode: unit.amount.currencyCode,
		value: unit.amount.value,
	},
	description: unit.description,
 })),
};

	const response = await ordersController.ordersCreate({
	body: orderRequest,
	});

	res.status(201).send(response.body);
	} catch (err) {
	return res.status(400).send({ error: err.message });	
	}
	});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
