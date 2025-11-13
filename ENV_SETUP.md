# Environment Variables Setup Guide

This guide will help you set up all the necessary environment variables for the Career Guidance Platform.

## Backend Environment Variables

### Step 1: Create Backend .env File

1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Or on Windows:
   ```powershell
   copy .env.example .env
   ```

### Step 2: Configure Firebase Admin SDK

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `backend/serviceAccountKey.json`
6. Extract the following values from the JSON file and add them to `backend/.env`:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and \n characters)
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `client_id` → `FIREBASE_CLIENT_ID`
   - `auth_uri` → `FIREBASE_AUTH_URI`
   - `token_uri` → `FIREBASE_TOKEN_URI`
   - `auth_provider_x509_cert_url` → `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`
   - `client_x509_cert_url` → `FIREBASE_CLIENT_X509_CERT_URL`

**Important:** The `FIREBASE_PRIVATE_KEY` must be in this format:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nActualKeyHere\n-----END PRIVATE KEY-----\n"
```

### Step 3: Configure Email Settings

For sending verification and password reset emails:

1. **For Gmail:**
   - Go to your Google Account settings
   - Enable **2-Step Verification**
   - Go to **App passwords** (under Security)
   - Generate a new app password for "Mail"
   - Use that password as `EMAIL_PASS` (not your regular Gmail password)

2. **For other email providers:**
   - Update `EMAIL_HOST` and `EMAIL_PORT` accordingly
   - Use your email credentials

### Step 4: Set JWT Secret

Generate a random secret string for JWT token signing:
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use any random string generator
```

## Frontend Environment Variables

### Step 1: Create Frontend .env File

1. Navigate to the `frontend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Or on Windows:
   ```powershell
   copy .env.example .env
   ```

### Step 2: Configure Backend API URL

1. For **development**, use:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

2. For **production**, use your deployed backend URL:
   ```
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

### Step 3: Configure Firebase Web Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **General**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click the web icon (`</>`) to add one
6. Copy the Firebase configuration object
7. Update `frontend/src/firebase/config.js` with your values:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

**Note:** You can also use environment variables in `config.js` if you prefer:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

## Quick Setup Checklist

### Backend
- [ ] Created `backend/.env` file
- [ ] Added Firebase service account credentials
- [ ] Configured email settings (Gmail app password)
- [ ] Set JWT secret
- [ ] Created `backend/serviceAccountKey.json` from Firebase

### Frontend
- [ ] Created `frontend/.env` file
- [ ] Set `REACT_APP_API_URL`
- [ ] Updated `frontend/src/firebase/config.js` with Firebase web config

## Security Notes

1. **Never commit `.env` files to version control!**
   - They are already in `.gitignore`
   - Only commit `.env.example` files

2. **Never share your service account key or private keys**

3. **Use strong, random JWT secrets in production**

4. **For production:**
   - Use environment variables provided by your hosting platform
   - Don't store sensitive data in code
   - Use secure secret management services

## Troubleshooting

### Backend Issues

**Error: "Cannot find module './serviceAccountKey.json'"**
- Make sure you've downloaded the service account key from Firebase
- Save it as `backend/serviceAccountKey.json`

**Error: "Invalid private key"**
- Check that `FIREBASE_PRIVATE_KEY` includes the `\n` characters
- Make sure the key is wrapped in quotes

**Email not sending:**
- Verify your email credentials
- For Gmail, make sure you're using an App Password, not your regular password
- Check that 2-Step Verification is enabled

### Frontend Issues

**Error: "Firebase: Error (auth/invalid-api-key)"**
- Verify your Firebase config in `src/firebase/config.js`
- Make sure you're using the web app config, not the service account

**API calls failing:**
- Check that `REACT_APP_API_URL` is correct
- Make sure the backend server is running
- Check CORS settings in backend

## Example .env Files

### backend/.env (Example)
```env
PORT=5000
FIREBASE_PROJECT_ID=my-career-platform
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@my-career-platform.iam.gserviceaccount.com
EMAIL_USER=myemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
REACT_APP_API_URL=http://localhost:3000
JWT_SECRET=my-super-secret-jwt-key-12345
```

### frontend/.env (Example)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Next Steps

After setting up environment variables:

1. **Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Test the application:
   - Register a new user
   - Check email verification
   - Test password reset

