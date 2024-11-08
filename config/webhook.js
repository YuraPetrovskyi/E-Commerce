const stripeAPI = require('./stripe');
const nodemailer = require('nodemailer');


// Функція для отримання деталей сесії Checkout і line items
async function getSessionDetailsAndLineItems(sessionId) {
  try {
    // Отримання деталей сесії Checkout
    const session = await stripeAPI.checkout.sessions.retrieve(sessionId);

    // Отримання line items, асоційованих з сесією Checkout
    const lineItems = await stripeAPI.checkout.sessions.listLineItems(sessionId, {limit: 100});

    return {session, lineItems};
  } catch (error) {
    console.error('Error retrieving session details and line items:', error);
    throw error;
  }
}



const webhook = async (req, res) => {
  console.log('started webhook with:', process.env.WEB_HOOK_SECRET);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    console.log('webhook try block');
    event = stripeAPI.webhooks.constructEvent(req['rawBody'], sig, process.env.WEB_HOOK_SECRET);
  } catch(error) {
    console.log(`Webhook error: ${error.message}`);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  console.log('webhook after try block');

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;
    // Отримання деталей line items
    const {lineItems} = await getSessionDetailsAndLineItems(sessionId);
    
    await sendEmail(session.customer_email, "webhook: Деталі Вашої Покупки", session, lineItems.data);
    
    console.log('Event data from Webhook: ', session);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send();
}

async function sendEmail(to, subject, session, lineItems) {
  // Налаштування Nodemailer для відправлення листа
  let transporter = nodemailer.createTransport({
    service: 'gmail',  // Використовуйте свій постачальник поштових послуг Наприклад, для Gmail
    auth: {
      user: 'yurakarpaty@gmail.com',
      pass: process.env.EMAIL_SEND_PASSWORD,
    },
  });

  // Setimg HTML

  // Формуємо HTML для кожного товару
  const itemsHtml = lineItems.map(item => `
  <tr>
    <td>${item.description}</td>
    <td>${item.quantity}</td>
    <td>$${(item.amount_total / 100).toFixed(2)}</td> <!-- Припускаючи, що ціна вказана в центах -->
  </tr>
  `).join(''); // Об'єднуємо всі HTML-рядки в один

  // Створюємо повний HTML-шаблон листа, вставляючи HTML товарів
  const htmlContent = `
    <h1>Dear ${session.customer_details.name}, thank you for your order!</h1>
    <h2>Here are the details of your order:</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <h3>Total Paid: $${(session.amount_total / 100).toFixed(2)}</h3>
    <h4>Your order will be delivered to: 
    ${session.shipping_details.address.city} city,
    ${session.shipping_details.address.line1}, ${session.shipping_details.address.postal_code}
    </h4>
  `;

  // Опції електронного листа
  let mailOptions = {
    from: 'yurakarpaty@gmail.com',
    to: to, // 'customer-email@example.com'
    subject: subject, 
    // text: "ssdasaas", // або html для відправлення HTML-листа
    html: htmlContent 
  };

  // Відправлення електронного листа
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.error('Send mail error:', error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = webhook;