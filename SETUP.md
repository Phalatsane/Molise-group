# Setup Guide for Career Guidance Platform

## Quick Start

### 1. Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Follow the setup wizard

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password"
   - Configure email templates (optional)

3. **Enable Firestore Database**
   - Go to Firestore Database
   - Click "Create Database"
   - Start in production mode (or test mode for development)
   - Choose a location

4. **Enable Storage**
   - Go to Storage
   - Click "Get Started"
   - Use default security rules for development

5. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps"
   - Click the web icon (`</>`)
   - Copy the config object

6. **Create Service Account**
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `backend/serviceAccountKey.json`

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` file:
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

# Email Configuration (for Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-random-secret-key
```

**Note for Email Setup:**
- For Gmail, you need to create an "App Password"
- Go to Google Account > Security > 2-Step Verification > App passwords
- Generate an app password and use it as EMAIL_PASS

Start backend:
```bash
npm start
# or
npm run dev  # for development with auto-reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Update `frontend/src/firebase/config.js` with your Firebase config:
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

Create `frontend/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm start
```

### 4. Create Admin User

After setting up, you'll need to create an admin user manually:

1. Register a user through the frontend
2. Go to Firebase Console > Firestore Database
3. Find the user document in the `users` collection
4. Update the `role` field to `"admin"`

Alternatively, you can create an admin user directly in Firestore:
- Collection: `users`
- Document ID: (auto-generated or use Firebase Auth UID)
- Fields:
  - `email`: "admin@example.com"
  - `role`: "admin"
  - `emailVerified`: true
  - `createdAt`: (timestamp)

Then create the user in Firebase Authentication with the same email.

## Firestore Collections Structure

The system uses the following collections:

- `users` - User accounts (students, institutes, companies, admins)
- `institutions` - Higher learning institutions
- `faculties` - Faculties under institutions
- `courses` - Courses under faculties
- `applications` - Student course applications
- `jobs` - Job postings by companies
- `jobApplications` - Job applications by students
- `notifications` - System notifications
- `companies` - Company profiles (linked to users)

## Testing the Application

1. **Register as Student**
   - Go to `/register`
   - Select "Student" role
   - Complete registration
   - Check email for verification link
   - Verify email and login

2. **Add HEIS Results**
   - Login as student
   - Go to "HEIS Results"
   - Add your results
   - Save

3. **Apply for Courses**
   - Go to "Applications"
   - Click "Apply for Course"
   - View qualified institutions
   - Apply for courses (max 2 per institution)

4. **Register as Institute**
   - Register with "Institute" role
   - After admin approval, login
   - Add faculties and courses
   - View and manage applications

5. **Register as Company**
   - Register with "Company" role
   - Wait for admin approval
   - Post jobs
   - View qualified applicants

## Troubleshooting

### Email Verification Not Working
- Check Firebase Authentication settings
- Verify email templates are configured
- Check backend email configuration
- Ensure EMAIL_PASS is an app password, not regular password

### Firestore Permission Errors
- Check Firestore security rules
- For development, you can use test mode
- For production, set up proper rules

### CORS Errors
- Ensure backend CORS is configured
- Check API_URL in frontend .env

### Authentication Errors
- Verify Firebase config is correct
- Check service account key is valid
- Ensure email is verified before login

## Production Deployment

### Backend
- Deploy to Heroku, AWS, or similar
- Update environment variables
- Ensure service account key is accessible

### Frontend
- Build: `npm run build`
- Deploy to Firebase Hosting, Netlify, or Vercel
- Update API_URL to production backend URL

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET
- [ ] Set up proper Firestore security rules
- [ ] Enable Firebase App Check (optional)
- [ ] Use HTTPS in production
- [ ] Keep service account key secure
- [ ] Regularly update dependencies

