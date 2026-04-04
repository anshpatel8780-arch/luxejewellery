const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, 
    socketTimeout: 30000 // 30 seconds for sending attachments
});

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (toEmail, otp, purpose = 'register-verify') => {
    const subjectMap = {
        'register-verify': '✨ Verify Your Luxé Account – OTP Inside',
        'forgot-password': '🔐 Reset Your Luxé Password – OTP Inside',
        'login-verify': '🛡️ Your Luxé Login Verification Code',
    };

    const headlineMap = {
        'register-verify': 'Welcome to Luxé Jewellery! 💎',
        'forgot-password': 'Password Reset Request',
        'login-verify': 'Login Verification',
    };

    const bodyMap = {
        'register-verify': 'Thank you for registering with <strong>Luxé Jewellery</strong>. Please use the OTP below to verify your email address and activate your account.',
        'forgot-password': 'We received a request to reset your password. Use the OTP below to proceed. If you did not request this, please ignore this email.',
        'login-verify': 'A login attempt was made on your account. Please use the OTP below to confirm your identity.',
    };

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subjectMap[purpose]}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#c9a96e 0%,#8b6914 100%);padding:36px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:2px;font-weight:700;">💎 LUXÉ JEWELLERY</h1>
                  <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:13px;letter-spacing:1px;">LUXURY • ELEGANCE • TIMELESS</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 40px 24px;">
                  <h2 style="color:#2c1810;margin:0 0 16px;font-size:22px;">${headlineMap[purpose]}</h2>
                  <p style="color:#555;line-height:1.7;margin:0 0 28px;font-size:15px;">${bodyMap[purpose]}</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <div style="display:inline-block;background:linear-gradient(135deg,#fdf6e3,#fce8b2);border:2px solid #c9a96e;border-radius:12px;padding:24px 48px;margin:0 auto;">
                          <p style="margin:0 0 8px;color:#8b6914;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Your OTP Code</p>
                          <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:12px;color:#2c1810;font-family:'Courier New',monospace;">${otp}</p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <p style="color:#888;font-size:13px;text-align:center;margin:20px 0 0;">
                    ⏱️ This OTP is valid for <strong>10 minutes</strong> only.<br/>
                    Do not share this code with anyone.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f5f0;padding:20px 40px;text-align:center;border-top:1px solid #ece8e1;">
                  <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} Luxé Jewellery. All rights reserved.</p>
                  <p style="margin:6px 0 0;color:#aaa;font-size:12px;">If you did not request this, please ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Luxé Jewellery" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subjectMap[purpose],
        html,
    });
};

const sendOrderCancellationEmail = async (user, order, type) => {
    let subject, headline, body;

    if (type === 'CANCEL_INSTANT') {
        subject = '🚫 Order Cancelled – Luxé Jewellery';
        headline = 'Your Order Has Been Cancelled';
        body = `Your order <strong>#${order._id}</strong> has been successfully cancelled. The items have been returned to our inventory.`;
    } else if (type === 'CANCEL_REQUESTED') {
        subject = '⏳ Cancellation Request Received – Luxé Jewellery';
        headline = 'Cancellation Request Pending';
        body = `We have received your request to cancel order <strong>#${order._id}</strong>. Our team will review it and notify you shortly.`;
    } else if (type === 'CANCEL_APPROVED') {
        subject = '✅ Cancellation Approved – Luxé Jewellery';
        headline = 'Your Cancellation Request Was Approved';
        body = `Good news! Your cancellation request for order <strong>#${order._id}</strong> has been approved. The order status is now "Cancelled".`;
    } else if (type === 'CANCEL_REJECTED') {
        subject = '❌ Cancellation Request Update – Luxé Jewellery';
        headline = 'Your Cancellation Request Was Declined';
        body = `We're sorry, but your cancellation request for order <strong>#${order._id}</strong> was not approved. The order will proceed as planned. <br/><br/><strong>Admin Note:</strong> ${order.cancellation.adminNote || 'No specific reason provided.'}`;
    }

    if (order.paymentMethod === 'Online' && (type === 'CANCEL_INSTANT' || type === 'CANCEL_APPROVED')) {
        body += '<br/><br/><strong>Refund Note:</strong> Your payment will be refunded to your original payment method soon.';
    }

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#c9a96e 0%,#8b6914 100%);padding:36px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:2px;font-weight:700;">💎 LUXÉ JEWELLERY</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 40px 24px;">
                  <h2 style="color:#2c1810;margin:0 0 16px;font-size:22px;">${headline}</h2>
                  <p style="color:#555;line-height:1.7;margin:0 0 28px;font-size:15px;">Hi ${user.name},<br/><br/>${body}</p>
                  <p style="color:#888;font-size:13px;text-align:center;margin:20px 0 0;">
                    If you have any questions, please contact our support team.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f5f0;padding:20px 40px;text-align:center;border-top:1px solid #ece8e1;">
                  <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} Luxé Jewellery. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    await transporter.sendMail({
        from: `"Luxé Jewellery" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject,
        html,
    });
};

const sendOrderConfirmationEmail = async (user, order, pdfBuffer) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#c9a96e 0%,#8b6914 100%);padding:36px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:2px;font-weight:700;">💎 LUXÉ JEWELLERY</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 40px 24px;">
                  <h2 style="color:#2c1810;margin:0 0 16px;font-size:24px;">Thank You so much for your order! 🙏</h2>
                  <p style="color:#555;line-height:1.8;margin:0 0 28px;font-size:16px;">Hi ${user.name},<br/><br/>
                  We are absolutely delighted to confirm your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong>! 💎<br/><br/>
                  At <strong>Luxé Jewellery</strong>, we strive to bring elegance and timeless beauty to your collection, and we're honored that you chose us for your purchase. Our team is already working hard to prepare your items for safe delivery.</p>
                  
                  <div style="background:#fdf6e3;border:2px solid #c9a96e;border-radius:12px;padding:24px;margin-bottom:28px;text-align:center;">
                    <p style="margin:0 0 8px;color:#8b6914;font-size:12px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Order Total</p>
                    <p style="margin:0;color:#2c1810;font-size:28px;font-weight:800;">₹${order.totalPrice.toLocaleString()}</p>
                    <p style="margin:8px 0 0;color:#555;font-size:14px;">Status: <strong>Order Confirmed</strong></p>
                  </div>

                  <p style="color:#555;line-height:1.7;margin:0 0 20px;font-size:15px;">
                    Please find your <strong>official Amazon-style Tax Invoice</strong> attached to this email. You can also track your order directly from your dashboard.
                  </p>

                  <p style="color:#2c1810;font-weight:600;margin:30px 0 0;font-size:15px;">Warm regards,<br/>The Luxé Jewellery Team</p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f5f0;padding:20px 40px;text-align:center;border-top:1px solid #ece8e1;">
                  <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} Luxé Jewellery. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
        const info = await transporter.sendMail({
            from: `"Luxé Jewellery" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `✨ Thank You for Your Order! Invoice #${order._id.toString().slice(-8).toUpperCase()} – Luxé Jewellery`,
            html,
            attachments: [
                {
                    filename: `Invoice_${order._id.toString().slice(-8).toUpperCase()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });
        console.log(`✅ Order confirmation email sent to ${user.email} (ID: ${info.messageId})`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send order confirmation email to ${user.email}:`, error);
        throw error;
    }
};

const sendOrderStatusUpdateEmail = async (user, order) => {
    const statusMap = {
        'Confirmed': { headline: 'Your Order is Confirmed! ✨', body: 'Great news! Your order has been confirmed and is now ready for processing.', color: '#50C878' },
        'Processing': { headline: 'We\'re Preparing Your Items! 🛠️', body: 'Your items are being carefully picked and packed by our master jewellers.', color: '#BB86FC' },
        'Shipped': { headline: 'Your Package is on its Way! 🚚', body: 'Exciting news! Your order has been shipped and will be with you very soon.', color: '#03DAC6' },
        'Delivered': { headline: 'Order Delivered Successfully! 🎁', body: 'Your Luxé Jewellery package has been delivered. We hope you love your new pieces!', color: '#00E676' },
        'Cancelled': { headline: 'Order Cancellation Update', body: 'Your order status has been updated to "Cancelled". If you have questions, please reach out.', color: '#CF6679' }
    };

    const config = statusMap[order.status] || { headline: 'Order Status Updated', body: `Your order status has been updated to: **${order.status}**`, color: '#c9a96e' };

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#c9a96e 0%,#8b6914 100%);padding:36px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:2px;font-weight:700;">💎 LUXÉ JEWELLERY</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 40px 24px;">
                  <h2 style="color:${config.color};margin:0 0 16px;font-size:22px;">${config.headline}</h2>
                  <p style="color:#555;line-height:1.7;margin:0 0 28px;font-size:15px;">Hi ${user.name},<br/><br/>
                  ${config.body}<br/><br/>
                  <strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}<br/>
                  <strong>New Status:</strong> <span style="color:${config.color};font-weight:700;">${order.status.toUpperCase()}</span>
                  </p>
                  
                  <div style="text-align:center;margin-top:30px;">
                    <a href="http://localhost:4200/dashboard" style="background:#2c1810;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Order Details</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background:#f9f5f0;padding:20px 40px;text-align:center;border-top:1px solid #ece8e1;">
                  <p style="margin:0;color:#aaa;font-size:12px;">© ${new Date().getFullYear()} Luxé Jewellery. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Luxé Jewellery" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `🔔 Status Update for Order #${order._id.toString().slice(-8).toUpperCase()} – Luxé Jewellery`,
            html,
        });
        console.log(`✅ Status update email (${order.status}) sent to ${user.email}`);
    } catch (err) {
        console.error(`❌ Failed to send status update email:`, err);
    }
};

const sendContactEmail = async (contactData) => {
    const { name, email, subject, message } = contactData;

    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#c9a96e 0%,#8b6914 100%);padding:36px 40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:26px;letter-spacing:2px;font-weight:700;">💎 NEW INQUIRY</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:40px 40px 24px;">
                  <h2 style="color:#2c1810;margin:0 0 16px;font-size:20px;">Customer Message Received</h2>
                  <div style="background:#f9f5f0;border-radius:8px;padding:20px;margin-bottom:24px;">
                    <p style="margin:0 0 8px;font-size:14px;color:#555;"><strong>From:</strong> ${name} (${email})</p>
                    <p style="margin:0 0 8px;font-size:14px;color:#555;"><strong>Subject:</strong> ${subject || 'No Subject'}</p>
                    <p style="margin:16px 0 0;font-size:15px;color:#2c1810;line-height:1.6;border-top:1px solid #ddd;padding-top:16px;">
                      ${message.replace(/\n/g, '<br/>')}
                    </p>
                  </div>
                  <p style="color:#888;font-size:13px;">This message was sent via the Luxé Jewellery Contact Form.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Luxé Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send TO the admin
            subject: `📩 New Inquiry: ${subject || 'Contact Form'}`,
            replyTo: email, // Allow admin to reply directly to customer
            html,
        });
        console.log(`✅ Contact email sent from ${email} to admin`);
    } catch (error) {
        console.error(`❌ Failed to send contact email:`, error);
        throw error;
    }
};

const sendCouponAnnouncementEmail = async (user, coupon) => {
    const discountText = coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`;
    const minOrderText = coupon.minOrderAmount > 0 ? `on orders above ₹${coupon.minOrderAmount.toLocaleString()}` : 'on all orders';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;color:#ffffff;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
        <tr>
          <td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border:1px solid #333;border-radius:24px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
              <tr>
                <td style="background:linear-gradient(135deg,#c9a96e 0%,#8b6914 100%);padding:40px;text-align:center;">
                  <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:4px;font-weight:800;text-transform:uppercase;">💎 Luxé Exclusive</h1>
                  <p style="color:rgba(255,255,255,0.9);margin:10px 0 0;font-size:14px;letter-spacing:2px;">AN UNMISSABLE OFFER FOR YOU</p>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;text-align:center;">
                  <h2 style="color:#c9a96e;margin:0 0 20px;font-size:24px;font-weight:600;">Hi ${user.name},</h2>
                  <p style="color:#aaa;line-height:1.8;margin:0 0 32px;font-size:16px;">We're excited to share an exclusive invitation with you! Discover our latest collection and enjoy an exceptional discount on your next purchase.</p>
                  
                  <div style="position:relative;background:#262626;border:2px dashed #c9a96e;border-radius:16px;padding:32px;margin-bottom:32px;">
                    <p style="margin:0 0 8px;color:#c9a96e;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Special Treat</p>
                    <h3 style="margin:0;color:#ffffff;font-size:42px;font-weight:800;">${discountText}</h3>
                    <p style="margin:8px 0 24px;color:#888;font-size:14px;">${minOrderText}</p>
                    
                    <div style="background:#000;border-radius:8px;padding:16px;display:inline-block;border:1px solid #444;">
                      <span style="color:#c9a96e;font-size:12px;display:block;margin-bottom:4px;letter-spacing:1px;text-transform:uppercase;">PROMO CODE</span>
                      <span style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:4px;">${coupon.code}</span>
                    </div>
                  </div>

                  <p style="color:#777;font-size:13px;margin-bottom:32px;">Valid until: <strong>${new Date(coupon.expiryDate).toLocaleDateString()}</strong></p>
                  
                  <a href="http://localhost:4200/shop" style="display:inline-block;background:#c9a96e;color:#000;padding:16px 40px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:1px;transition:0.3s;">SHOP THE COLLECTION</a>
                </td>
              </tr>
              <tr>
                <td style="background:#111;padding:30px;text-align:center;border-top:1px solid #333;">
                  <p style="margin:0;color:#555;font-size:12px;letter-spacing:1px;">© ${new Date().getFullYear()} LUXÉ JEWELLERY. ALL RIGHTS RESERVED.</p>
                  <p style="margin:10px 0 0;color:#444;font-size:11px;line-height:1.5;">You are receiving this email as a registered member of Luxé Jewellery.<br/>To manage your notifications, please visit your account dashboard.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Luxé Jewellery" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `🎁 A Special Gift for You: ${discountText} at Luxé Jewellery`,
            html,
        });
        console.log(`✅ Coupon mail sent to ${user.email}`);
    } catch (error) {
        console.error(`❌ Failed to send coupon mail to ${user.email}:`, error);
    }
};

module.exports = { generateOTP, sendOTPEmail, sendOrderCancellationEmail, sendOrderConfirmationEmail, sendContactEmail, sendCouponAnnouncementEmail, sendOrderStatusUpdateEmail };
