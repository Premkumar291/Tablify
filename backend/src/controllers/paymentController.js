export const createPaymentIntent = async (req, res) => {
    res.status(503).json({ error: 'Payment system is currently disabled.' });
};

export const webhook = async (req, res) => {
    res.status(200).send('Webhook received but ignored (system disabled).');
};
