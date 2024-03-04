const stripeAPI = require('./stripe');

async function webhook(req, res) {
  console.log('started webhook with:', process.env.WEB_HOOK_SECRET);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeAPI.webhooks.constructEvent(
      req['rawBody'], sig, process.env.WEB_HOOK_SECRET);
  } catch(error) {
    console.log(`Webhook error: ${error.message}`);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Event data from Webhook: ', session);
  }
}

module.exports = webhook;