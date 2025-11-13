const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { db } = require('../server');
const { authenticate } = require('../middleware/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, additionalData } = req.body;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false
    });

    // Create user document in Firestore
    const baseData = {
      uid: userRecord.uid,
      email,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      emailVerified: false
    };

    let extraData = { ...additionalData };

    if (role === 'company') {
      const companyDefaults = {
        companyName: additionalData.companyName || '',
        email,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        website: '',
        phone: '',
        address: '',
        description: '',
        industry: '',
        companySize: ''
      };
      await db.collection('companies').doc(userRecord.uid).set(companyDefaults);
      extraData = { ...companyDefaults, ...extraData };
    }

    if (role === 'institute') {
      const institutionPayload = {
        name: additionalData.institutionName || '',
        description: '',
        address: '',
        website: '',
        phone: '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: userRecord.uid
      };

      const institutionRef = await db.collection('institutions').add(institutionPayload);

      extraData = {
        ...extraData,
        institutionName: additionalData.institutionName || '',
        institutionId: institutionRef.id,
        phone: '',
        address: '',
        description: '',
        website: ''
      };
    }

    if (role === 'student') {
      extraData = {
        ...extraData,
        name: additionalData.name || '',
        heisResults: [],
        heisResultsAdded: false,
        transcriptEntries: [],
        additionalCertificates: [],
        transcriptComplete: false
      };
    }

    const userData = { ...baseData, ...extraData };
    await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });

    // Send email verification
    const emailVerificationLink = await admin.auth().generateEmailVerificationLink(email);
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email address',
      html: `
        <h2>Welcome to Career Guidance Platform</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${emailVerificationLink}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });

    res.status(201).json({ 
      message: 'Registration successful. Please check your email for verification.',
      uid: userRecord.uid 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Get user from Firestore
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    // Verify email is verified
    const userRecord = await admin.auth().getUser(userData.uid);
    if (!userRecord.emailVerified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    // Create custom token (in production, use Firebase Auth SDK on client)
    const customToken = await admin.auth().createCustomToken(userData.uid);

    res.json({ 
      token: customToken,
      user: {
        uid: userData.uid,
        email: userData.email,
        role: userData.role
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnapshot.docs[0].data();
    const passwordResetLink = await admin.auth().generatePasswordResetLink(email);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${passwordResetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

