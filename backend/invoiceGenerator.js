const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  }
};


const printer = new PdfPrinter(fonts);

function generateInvoicePDF(order) {
  // Create table body with header row
  const body = [
    [
      { text: 'Product', style: 'tableHeader' },
      { text: 'Quantity', style: 'tableHeader' },
      { text: 'Price', style: 'tableHeader' }
    ],
    ...order.line_items.map((item, index) => {
      const bgColor = index % 2 === 0 ? '#ffffff' : '#494847';
      const textColor = index % 2 === 0 ? '#000000' : '#ffffff';
      return [
        { text: item.title, fillColor: bgColor, color: textColor },
        { text: item.quantity.toString(), fillColor: bgColor, color: textColor },
        { text: `$${item.price}`, fillColor: bgColor, color: textColor }
      ];
    })
  ];

  const docDefinition = {
    content: [
      { text: 'INVOICE', style: 'header' },
      { text: `Order #${order.id}`, style: 'subheader' },
      {
        style: 'tableExample',
        table: {
          widths: ['*', 'auto', 'auto'],
          body: body
        },
        layout: {
          fillColor: function (rowIndex) {
            return (rowIndex === 0) ? '#1a1a1a' : null; // header row color
          },
          hLineColor: '#dee2e6',
          vLineColor: '#dee2e6',
          paddingLeft: function () { return 12; },
          paddingRight: function () { return 12; },
          paddingTop: function () { return 8; },
          paddingBottom: function () { return 8; }
        }
      },
      { text: '\nThank you for shopping with RIWAARA — Timeless Tradition.', style: 'footer' }
    ],
    styles: {
      header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
      subheader: { fontSize: 16, alignment: 'center', margin: [0, 0, 0, 20] },
      tableExample: { margin: [0, 5, 0, 15] },
      tableHeader: { bold: true, fontSize: 13, color: 'white', fillColor: '#1a1a1a', alignment: 'left' },
      footer: { fontSize: 12, alignment: 'center', margin: [0, 30, 0, 0], color: '#6c757d' }
    },
    defaultStyle: {
      font: 'Roboto'
    }
  };

  // Write the PDF to file
  const filePath = path.join(__dirname, `../invoices/invoice-${order.id}.pdf`);
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.end();

  return filePath;
}

module.exports = { generateInvoice: generateInvoicePDF };

// const puppeteer = require('puppeteer');
// const fs = require('fs');
// const path = require('path');

// function generateInvoiceHTML(order) {
//     //     const itemsHtml = order.line_items.map((item, index) => {
//     //         const rowColor = index % 2 === 0 ? '#ffffff' : '#494847';
//     //         return `<tr style="background-color: ${rowColor};">
//     //     <td>${item.title}</td>
//     //     <td>${item.quantity}</td>
//     //     <td>$${item.price}</td>
//     //   </tr>`;
//     //     }).join('');
//     const itemsHtml = order.line_items.map((item, index) => {
//         const bgColor = index % 2 === 0 ? '#ffffff' : '#494847';
//         const textColor = index % 2 === 0 ? '#000' : '#fff';
//         return `
//     <tr style="background-color: ${bgColor}; color: ${textColor};">
//       <td>${item.title}</td>
//       <td>${item.quantity}</td>
//       <td>$${item.price}</td>
//     </tr>`;
//     }).join('');


//     const htmlTemplate = fs.readFileSync(path.join(__dirname, 'templates/invoiceTemplate.html'), 'utf8');

//     return htmlTemplate
//         .replace('{{order_id}}', order.id)
//         .replace('{{items}}', itemsHtml);
// }


// async function generateInvoice(order) {
//     const html = generateInvoiceHTML(order);
//     fs.writeFileSync('./debug-invoice.html', html);

//     const filePath = path.join(__dirname, `../invoices/invoice-${order.id}.pdf`);

//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.setContent(html, { waitUntil: 'networkidle0' });
//     await page.emulateMediaType('screen'); // Important!

//     await page.pdf({ path: filePath, format: 'A4' });

//     await browser.close();
// }
// module.exports = { generateInvoice };
