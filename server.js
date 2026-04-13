const express = require('express');
const sqlite3 = require('sqlite3').verbose();
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

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cansinozk@gmail.com', // Gmail adresin
    pass: 'khph kcvd ealk mdwi' // Gmail app password'un
  }
});

// SQLite Database
const db = new sqlite3.Database('./contact_submissions.db', (err) => {
  if (err) console.error(err.message);
  else console.log('SQLite3 database created/connected');
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    entreprise TEXT,
    service TEXT NOT NULL,
    budget TEXT,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Contact form endpoint
app.post('/sendmail', (req, res) => {
  const { nom, email, entreprise, service, budget, message } = req.body;

  // Save to database
  db.run(
    `INSERT INTO submissions (nom, email, entreprise, service, budget, message) VALUES (?, ?, ?, ?, ?, ?)`,
    [nom, email, entreprise || '', service, budget || '', message],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement' });
      }

      // Send email
      const mailOptions = {
        from: email,
        to: 'cansinozk@gmail.com',
        subject: `Nouveau message de contact - ${nom}`,
        html: `
          <h3>Nouveau message de contact</h3>
          <p><strong>Nom:</strong> ${nom}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Entreprise:</strong> ${entreprise || 'Non spécifié'}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Budget:</strong> ${budget || 'Non spécifié'}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Email error:', error);
          res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi' });
        } else {
          console.log('✓ Email sent to cansinozk@gmail.com from', email);
          res.json({ success: true, message: 'Message envoyé avec succès' });
        }
      });
    }
  );
});

// Admin endpoint - view all submissions
app.get('/admin/submissions', (req, res) => {
  db.all(`SELECT * FROM submissions ORDER BY timestamp DESC`, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});