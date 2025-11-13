# Quick Start Guide - Environment Setup

## Step 1: Backend Setup

### 1.1 Create Backend .env File

Create a file named `.env` in the `backend` folder with the following content:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-random-secret-key
```

### 1.2 Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `backend/serviceAccountKey.json`
6. Copy values from the JSON to your `.env` file

### 1.3 Get Gmail App Password (for email)

1. Go to [Google Account](https://myaccount.google.com/)
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate password for "Mail"
5. Use that password as `EMAIL_PASS`

## Step 2: Frontend Setup

### 2.1 Create Frontend .env File

Create a file named `.env` in the `frontend` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 2.2 Get Firebase Web Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **General**
4. Scroll to **Your apps**
5. Click web icon (`</>`) if you don't have a web app
6. Copy the config values to your `.env` file

### 2.3 Update Firebase Config (Alternative)

Alternatively, you can directly update `frontend/src/firebase/config.js`:

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

## Step 3: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 4: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## Step 5: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Important Notes

1. **Never commit `.env` files** - They're already in `.gitignore`
2. **Use `.env.example` files as templates**
3. **For production**, use your hosting platform's environment variable settings

## Troubleshooting

- **Backend won't start**: Check that `serviceAccountKey.json` exists
- **Email not working**: Verify Gmail app password is correct
- **Firebase errors**: Double-check all config values match your Firebase project

For detailed setup instructions, see `ENV_SETUP.md`

