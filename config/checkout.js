const stripeAPI = require('./stripe');

async function createCheckoutSession(req, res) {
  const domainUrl = process.env.WEB_APP_URL;
  const { line_items, customer_email, order_id } = req.body;
  console.log(domainUrl, line_items, customer_email, order_id );

  // check req body has line items and email
  if (!line_items || !customer_email) {
    return res.status(400).json({ error: 'missing required session parameters'});
  }

  let session;
    console.log('before try block');
    console.log('line_items : ', line_items[0]);

    try {
    session = await stripeAPI.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email,
      success_url: `${domainUrl}/success/${order_id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/canceled`,
      shipping_address_collection: { allowed_countries: ['GB', 'US'] }
    });
    console.log('before error. after try block', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: 'an error occured, unable to create session'});
  }
}

module.exports = createCheckoutSession;