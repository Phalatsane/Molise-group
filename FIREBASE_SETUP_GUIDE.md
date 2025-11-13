# Firebase Setup Guide - Step by Step

Follow these steps in order to connect Firebase to your Career Guidance Platform.

## Prerequisites
- A Google account
- Node.js installed on your computer
- Basic terminal/command prompt knowledge

---

## STEP 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Open your browser and go to: https://console.firebase.google.com/
2. Sign in with your Google account

### 1.2 Create New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: `career-guidance-platform` (or any name you prefer)
3. Click **"Continue"**
4. **Disable** Google Analytics (optional, you can enable later if needed)
5. Click **"Create project"**
6. Wait for project creation (takes about 30 seconds)
7. Click **"Continue"** when done

---

## STEP 2: Enable Firebase Services

### 2.1 Enable Authentication
1. In Firebase Console, click **"Authentication"** in the left menu
2. Click **"Get started"**
3. Click on **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. **Enable** the first toggle (Email/Password)
6. Click **"Save"**

### 2.2 Enable Firestore Database
1. Click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Select **"Start in production mode"** (we'll set rules later)
4. Click **"Next"**
5. Choose a location (select closest to your users, e.g., `us-central1`)
6. Click **"Enable"**
7. Wait for database creation

### 2.3 Enable Storage
1. Click **"Storage"** in the left menu
2. Click **"Get started"**
3. Click **"Next"** (use default security rules for now)
4. Choose same location as Firestore
5. Click **"Done"**

---

## STEP 3: Get Backend Credentials (Service Account)

### 3.1 Generate Service Account Key
1. Click the **gear icon** (⚙️) next to "Project Overview" at the top
2. Click **"Project settings"**
3. Go to **"Service accounts"** tab
4. Click **"Generate new private key"**
5. A popup will appear - click **"Generate key"**
6. A JSON file will download automatically - **SAVE THIS FILE!**

### 3.2 Save Service Account Key
1. **Rename** the downloaded file to: `serviceAccountKey.json`
2. **Move** this file to: `backend/serviceAccountKey.json`
   - Full path should be: `C:\Users\USER\Molise Group\backend\serviceAccountKey.json`

### 3.3 Extract Values for .env File
1. **Open** the `serviceAccountKey.json` file in a text editor
2. You'll see something like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## STEP 4: Configure Backend

### 4.1 Create Backend .env File
1. Navigate to: `C:\Users\USER\Molise Group\backend\`
2. Create a new file named: `.env`
3. Open it in a text editor

### 4.2 Fill in Backend .env File
Copy this template and replace with YOUR values from `serviceAccountKey.json`:

```env
PORT=5000

# Copy these EXACTLY from serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id-from-json
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour entire private key from json\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email-from-json
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-client-x509-cert-url-from-json

# Email Configuration (for sending verification emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
FRONTEND_URL=http://localhost:3000

# JWT Secret (generate a random string)
JWT_SECRET=my-super-secret-jwt-key-12345-change-this
```

**Important Notes:**
- For `FIREBASE_PRIVATE_KEY`: Copy the ENTIRE private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep the `\n` characters in the private key
- Wrap the entire private key in double quotes

### 4.3 Get Gmail App Password (for Email)
1. Go to: https://myaccount.google.com/
2. Click **"Security"** in the left menu
3. Under **"How you sign in to Google"**, enable **"2-Step Verification"** (if not already enabled)
4. After enabling, go back to Security
5. Under **"2-Step Verification"**, click **"App passwords"**
6. Select app: **"Mail"**
7. Select device: **"Other (Custom name)"** - type "Career Platform"
8. Click **"Generate"**
9. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
10. Use this as your `EMAIL_PASS` in `.env` (remove spaces: `abcdefghijklmnop`)

---

## STEP 5: Get Frontend Credentials (Web Config)

### 5.1 Get Web App Configuration
1. In Firebase Console, click the **gear icon** (⚙️) again
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't see a web app, click the **web icon** (`</>`)
5. Register app with nickname: `Career Guidance Web`
6. Click **"Register app"**
7. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**Copy these values!**

---

## STEP 6: Configure Frontend

### 6.1 Option A: Update config.js Directly (Easier)
1. Navigate to: `C:\Users\USER\Molise Group\frontend\src\firebase\config.js`
2. Open the file
3. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",  // Your actual apiKey
  authDomain: "your-project.firebaseapp.com",     // Your actual authDomain
  projectId: "your-project-id",                   // Your actual projectId
  storageBucket: "your-project.appspot.com",      // Your actual storageBucket
  messagingSenderId: "123456789012",              // Your actual messagingSenderId
  appId: "1:123456789012:web:abcdef1234567890"    // Your actual appId
};
```

### 6.2 Option B: Use Environment Variables (Recommended for Production)
1. Navigate to: `C:\Users\USER\Molise Group\frontend\`
2. Create a new file named: `.env`
3. Add this content:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-actual-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## STEP 7: Install Dependencies

### 7.1 Install Backend Dependencies
1. Open terminal/command prompt
2. Navigate to backend folder:
```bash
cd "C:\Users\USER\Molise Group\backend"
```
3. Install packages:
```bash
npm install
```

### 7.2 Install Frontend Dependencies
1. Open a NEW terminal/command prompt
2. Navigate to frontend folder:
```bash
cd "C:\Users\USER\Molise Group\frontend"
```
3. Install packages:
```bash
npm install
```

---

## STEP 8: Test the Connection

### 8.1 Start Backend Server
1. In the backend terminal:
```bash
cd "C:\Users\USER\Molise Group\backend"
npm start
```
2. You should see: `Server is running on port 5000`
3. If you see errors, check:
   - Is `serviceAccountKey.json` in the backend folder?
   - Are all values in `.env` correct?
   - Did you install dependencies?

### 8.2 Start Frontend Server
1. In the frontend terminal:
```bash
cd "C:\Users\USER\Molise Group\frontend"
npm start
```
2. Browser should open automatically to: http://localhost:3000
3. If you see errors, check:
   - Is Firebase config correct in `config.js`?
   - Did you install dependencies?

### 8.3 Test Registration
1. Go to: http://localhost:3000/register
2. Fill in the registration form
3. Click "Register"
4. Check your email for verification link
5. If email doesn't arrive, check:
   - Gmail app password is correct
   - Email settings in backend `.env`

---

## STEP 9: Verify Everything Works

### Checklist:
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Registration form works
- [ ] Email verification email is received
- [ ] Can login after email verification
- [ ] Can see dashboard after login

---

## Common Issues & Solutions

### Issue 1: "Cannot find module './serviceAccountKey.json'"
**Solution:** Make sure the file is named exactly `serviceAccountKey.json` and is in the `backend` folder

### Issue 2: "Invalid private key"
**Solution:** 
- Make sure the private key includes `\n` characters
- Keep the BEGIN and END lines
- Wrap entire key in double quotes

### Issue 3: "Firebase: Error (auth/invalid-api-key)"
**Solution:** 
- Double-check your Firebase config values
- Make sure you're using Web App config, not Service Account

### Issue 4: Email not sending
**Solution:**
- Verify Gmail app password (not regular password)
- Make sure 2-Step Verification is enabled
- Check EMAIL_USER and EMAIL_PASS in backend `.env`

### Issue 5: CORS errors
**Solution:**
- Make sure backend is running on port 5000
- Check REACT_APP_API_URL in frontend `.env`

---

## Next Steps

Once Firebase is connected:
1. Test user registration
2. Test email verification
3. Test password reset
4. Create an admin user (manually in Firestore)
5. Start using the application!

---

## Need Help?

If you encounter issues:
1. Check the error message carefully
2. Verify all config values are correct
3. Make sure all services are enabled in Firebase Console
4. Check that both servers are running

Good luck! 🚀

