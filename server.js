const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Contact form endpoint
app.post('/sendmail', (req, res) => {
  const { nom, email, entreprise, service, budget, message } = req.body;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER,
    replyTo: email,
    subject: `Nouveau projet OBPIO — ${nom}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #534AB7;">Nouveau message de contact</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px; font-weight:bold;">Nom</td><td style="padding:8px;">${nom}</td></tr>
          <tr style="background:#f5f5f5;"><td style="padding:8px; font-weight:bold;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Entreprise</td><td style="padding:8px;">${entreprise || '—'}</td></tr>
          <tr style="background:#f5f5f5;"><td style="padding:8px; font-weight:bold;">Service</td><td style="padding:8px;">${service || '—'}</td></tr>
          <tr><td style="padding:8px; font-weight:bold;">Budget</td><td style="padding:8px;">${budget || '—'}</td></tr>
          <tr style="background:#f5f5f5;"><td style="padding:8px; font-weight:bold;">Message</td><td style="padding:8px;">${message}</td></tr>
        </table>
        <p style="color:#999; font-size:12px; margin-top:24px;">Envoyé depuis obpio.fr</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email error:', error);
      res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi' });
    } else {
      console.log('✓ Mail envoyé:', info.response);
      res.json({ success: true, message: 'Message envoyé avec succès' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`OBPIO Server running on http://localhost:${PORT}`);
});
