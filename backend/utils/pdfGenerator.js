const PDFDocument = require('pdfkit');

/**
 * Generates a professional Amazon/Meesho-style PDF invoice.
 * @param {Object} order - The order object.
 * @returns {Promise<Buffer>}
 */
const generateInvoicePDF = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', err => reject(err));

            // Formatting Constants
            const blueColor = '#232f3e'; // Amazon Dark Blue
            const goldColor = '#D4AF37'; 
            const secondaryColor = '#565959';
            const borderColor = '#D5D9D9';

            // --- HEADER ---
            // Title
            doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text('Tax Invoice/Bill of Supply', { align: 'right' });
            doc.fontSize(10).font('Helvetica').text('(Original for Recipient)', { align: 'right' });
            doc.moveDown(1.5);

            const startY = doc.y;

            // Sold By (Left Side)
            doc.fontSize(10).font('Helvetica-Bold').text('Sold By:', 40, startY);
            doc.font('Helvetica').text('LUXÉ JEWELLERY PRIVATE LIMITED', 40, startY + 15);
            doc.text('123, Diamond Avenue, Surat,', 40, startY + 28);
            doc.text('Gujarat, India - 395006', 40, startY + 41);
            doc.text('GST Registration No: 24AAACL1234A1Z5', 40, startY + 54);
            doc.text('Contact: support@luxejewellery.com', 40, startY + 67);

            // Invoice Details (Right Side)
            const detailsX = 350;
            doc.font('Helvetica-Bold').text('Order ID: ', detailsX, startY);
            doc.font('Helvetica').text(`#${(order._id || 'N/A').toString().toUpperCase()}`, detailsX + 60, startY);
            
            doc.font('Helvetica-Bold').text('Invoice Date: ', detailsX, startY + 15);
            doc.font('Helvetica').text(new Date(order.createdAt || Date.now()).toLocaleDateString(), detailsX + 70, startY + 15);

            doc.font('Helvetica-Bold').text('Payment Method: ', detailsX, startY + 30);
            doc.font('Helvetica').text(order.paymentMethod || 'N/A', detailsX + 90, startY + 30);

            doc.font('Helvetica-Bold').text('Order Status: ', detailsX, startY + 45);
            doc.font('Helvetica').text((order.status || 'PENDING').toUpperCase(), detailsX + 70, startY + 45);

            doc.moveDown(5);

            // --- ADDRESS BOXES ---
            const addressY = doc.y;
            const addr = order.address || {};
            
            // Billing Address
            doc.rect(40, addressY, 250, 100).strokeColor(borderColor).stroke();
            doc.fillColor(blueColor).font('Helvetica-Bold').fontSize(11).text('Billing Address:', 50, addressY + 10);
            doc.fillColor('#000000').font('Helvetica').fontSize(10);
            doc.text(addr.name || 'Valued Customer', 50, addressY + 28, { width: 230 });
            doc.text(addr.street || 'Address not provided', 50, addressY + 41, { width: 230 });
            doc.text(`${addr.city || ''}, ${addr.pincode || ''}`, 50, addressY + 54, { width: 230 });
            doc.text(`Phone: ${addr.phone || 'N/A'}`, 50, addressY + 67);

            // Shipping Address
            doc.rect(305, addressY, 250, 100).strokeColor(borderColor).stroke();
            doc.fillColor(blueColor).font('Helvetica-Bold').fontSize(11).text('Shipping Address:', 315, addressY + 10);
            doc.fillColor('#000000').font('Helvetica').fontSize(10);
            doc.text(addr.name || 'Valued Customer', 315, addressY + 28, { width: 230 });
            doc.text(addr.street || 'Address not provided', 315, addressY + 41, { width: 230 });
            doc.text(`${addr.city || ''}, ${addr.pincode || ''}`, 315, addressY + 54, { width: 230 });
            doc.text(`Phone: ${addr.phone || 'N/A'}`, 315, addressY + 67);

            doc.moveDown(8);

            // --- PRODUCT TABLE ---
            const tableTop = doc.y;
            
            // Header Bar
            doc.rect(40, tableTop, 515, 25).fill(blueColor);
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
            doc.text('Sl.', 50, tableTop + 7);
            doc.text('Description', 80, tableTop + 7);
            doc.text('Unit Price', 320, tableTop + 7, { align: 'right', width: 60 });
            doc.text('Qty', 400, tableTop + 7, { align: 'center', width: 30 });
            doc.text('Net Amount', 450, tableTop + 7, { align: 'right', width: 90 });

            let currentY = tableTop + 25;

            // Rows
            (order.products || []).forEach((item, index) => {
                doc.fillColor('#000000').font('Helvetica').fontSize(10);
                
                // Row border
                doc.rect(40, currentY, 515, 30).strokeColor(borderColor).stroke();
                
                doc.text((index + 1).toString(), 50, currentY + 10);
                doc.font('Helvetica-Bold').text(item.name || 'Product', 80, currentY + 10, { width: 230, ellipsis: true });
                doc.font('Helvetica').text(`₹${(item.price || 0).toLocaleString()}`, 320, currentY + 10, { align: 'right', width: 60 });
                doc.text((item.quantity || 1).toString(), 400, currentY + 10, { align: 'center', width: 30 });
                doc.text(`₹${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`, 450, currentY + 10, { align: 'right', width: 90 });
                
                currentY += 30;
            });

            // --- TOTALS ---
            const summaryY = currentY + 10;
            doc.rect(340, summaryY, 215, 60).strokeColor(borderColor).stroke();
            
            doc.font('Helvetica').text('Subtotal:', 350, summaryY + 10);
            doc.text(`₹${(order.totalPrice || 0).toLocaleString()}`, 450, summaryY + 10, { align: 'right', width: 90 });

            doc.text('Delivery Charges:', 350, summaryY + 25);
            doc.text('₹0.00', 450, summaryY + 25, { align: 'right', width: 90 });

            doc.font('Helvetica-Bold').fontSize(12).text('TOTAL:', 350, summaryY + 42);
            doc.fontSize(14).fillColor(blueColor).text(`₹${(order.totalPrice || 0).toLocaleString()}`, 450, summaryY + 40, { align: 'right', width: 90 });

            // Amount in words placeholder
            doc.moveDown(5);
            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text('Amount in Words:', 40, summaryY + 80);
            doc.font('Helvetica').text('Indian Rupees Only.', 40, summaryY + 95);

            // --- SIGNATURE FOOTER ---
            const footerY = 700;
            doc.rect(350, footerY, 205, 80).strokeColor(borderColor).stroke();
            doc.fontSize(9).font('Helvetica-Bold').text('For LUXÉ JEWELLERY PRIVATE LIMITED:', 360, footerY + 10);
            
            // Signature placeholder or stamp text
            doc.moveDown(2);
            doc.font('Helvetica-Oblique').text('Authorized Signatory', 410, footerY + 55);

            doc.fontSize(8).font('Helvetica').fillColor(secondaryColor).text('This is a computer generated invoice and does not require a physical signature.', 40, 750, { align: 'center' });
            doc.text('Returns Policy: Items can be returned within 7 days of delivery in original condition.', 40, 762, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateInvoicePDF };
