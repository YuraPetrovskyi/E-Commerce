const stripeAPI = require('./stripe');
const nodemailer = require('nodemailer');

const email_stripe = async (req, res) => {
  try {
    const session = await stripeAPI.checkout.sessions.retrieve(req.params.sessionId);
    console.log('get /api/checkout-session/: Stripe: ', session)
    const lineItems = await stripeAPI.checkout.sessions.listLineItems(session.id, {limit: 100});
    console.log('get /api/checkout-session/: Stripe: lineItems ======>: ', lineItems.data)
    
    await sendEmail(session.customer_email, "New purches on e-commers", session, lineItems.data);

    res.status(200).json(session);
  } catch (error) {
    console.error('Failed to retrieve checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function sendEmail(to, subject, session, lineItems) {
  // Налаштування Nodemailer для відправлення листа
  let transporter = nodemailer.createTransport({
    service: 'gmail',  // Використовуйте свій постачальник поштових послуг Наприклад, для Gmail
    auth: {
      user: 'yurakarpaty@gmail.com',
      pass: 'ubha slvg lrsj srgx',
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
    <h1>Дорогий ${session.customer_details.name}! Дякуємо за ваше замовлення!</h1>
    <h2>Ось деталі вашого замовлення:</h2>
    <table>
      <thead>
        <tr>
          <th>Товар</th>
          <th>Кількість</th>
          <th>Ціна</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <h3>Всього оплачено ${(session.amount_total / 100).toFixed(2)}</h3>
    <h4>Товар буде доставлено за адресою: 
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

module.exports = email_stripe;
