const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { generateInvoice } = require('./invoiceGenerator');

const app = express();
app.use(bodyParser.json());

const crypto = require('crypto');

function verifyShopifyWebhook(req, res, next) {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const body = JSON.stringify(req.body);
  const digest = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('base64');

  if (digest === hmac) {
    next();
  } else {
    return res.status(401).send('Unauthorized');
  }
}


// Shopify webhook listener
app.post('/webhooks/orders/create',verifyShopifyWebhook, async (req, res) => {
  const order = req.body;
  try {
    await generateInvoice(order);
    res.status(200).send('Invoice generated');
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).send('Error');
  }
});

app.get('/test-generate', async (req, res) => {
  const fakeOrder = {
    id: 123456789,
    line_items: [
      { title: 'Test Product A', quantity: 2, price: '10.00' },
      { title: 'Test Product B', quantity: 1, price: '20.00' },
    ],
  };
  await generateInvoice(fakeOrder);
  res.send('Test invoice generated!');
});

app.get('/invoice/:orderId/download', (req, res) => {
  const orderId = req.params.orderId;
  const filePath = path.join(__dirname, `../invoices/invoice-${orderId}.pdf`);

  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).send('Invoice not found');
  }
});


app.use('/', express.static(path.join(__dirname, '../public')));

// Serve invoices
app.use('/invoices', express.static(path.join(__dirname, '../invoices')));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});