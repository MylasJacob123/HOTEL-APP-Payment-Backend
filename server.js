const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

app.use(cors({
  origin: "http://localhost:3002",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Send confirmation email endpoint
app.post('/send-confirmation', async (req, res) => {
  try {
    // Extract data from the request body
    const { email, firstName, lastName, bookingData } = req.body;

    // Validate that all required fields are present
    if (!email || !firstName || !lastName || !bookingData) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Destructure the booking details
    const { roomType, checkin, checkout, nights, guests, paid, payerName, totalPrice } = bookingData;

    // Setup nodemailer transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,  // Use SSL (true) or not (false)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Construct the email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Thank you for booking with us! Here are your booking details:</p>
        <ul>
          <li><strong>Room Type:</strong> ${roomType}</li>
          <li><strong>Check-in:</strong> ${checkin}</li>
          <li><strong>Check-out:</strong> ${checkout}</li>
          <li><strong>Nights:</strong> ${nights}</li>
          <li><strong>Guests:</strong> ${guests}</li>
          <li><strong>Total Price:</strong> R${totalPrice}</li>
        </ul>
        <p>We look forward to hosting you!</p>
        <p>Best regards,<br>Greywood Hotel</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with a success message
    res.status(200).json({ message: 'Confirmation email sent successfully!' });

  } catch (error) {
    console.error('Error sending confirmation email:', error);
    res.status(500).json({ message: 'Failed to send confirmation email.' });
  }
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on https://hotel-app-payment-backend-1.onrender.com`);
});
