# Career Guidance and Employment Integration Platform

A comprehensive web application platform designed to assist high school students in Lesotho to discover higher learning institutions, apply for courses, and find employment opportunities after graduation.

## Features

### Admin Module
- Manage institutions, faculties, and courses
- Approve, suspend, or delete company accounts
- View system reports and statistics

### Institute Module
- Register and manage institution profile
- Add and manage faculties and courses
- View student applications
- Publish admissions
- Manage student admission status

### Student Module
- Register and verify email
- Add HEIS (Higher Education Information System) results manually
- View qualified institutions and courses based on results
- Apply for courses (maximum 2 per institution)
- View admission results
- Upload academic transcripts and certificates
- Browse and apply for job opportunities
- Receive notifications for matching job opportunities

### Company Module
- Register and verify email
- Post job opportunities with requirements
- View qualified applicants automatically filtered by the system
- Manage company profile

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Hosting**: Firebase Hosting

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- Firebase project with Firestore, Authentication, and Storage enabled

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase service account:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Generate a new private key
   - Save it as `serviceAccountKey.json` in the `backend` directory

4. Create a `.env` file in the `backend` directory:
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:3000

JWT_SECRET=your-jwt-secret-key
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update Firebase configuration in `src/firebase/config.js`:
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

4. Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Firebase Configuration

### Enable Authentication
1. Go to Firebase Console > Authentication
2. Enable Email/Password authentication
3. Configure email templates for verification and password reset

### Enable Firestore
1. Go to Firebase Console > Firestore Database
2. Create database in production mode
3. Set up security rules (for development, you can use test mode)

### Enable Storage
1. Go to Firebase Console > Storage
2. Enable Storage
3. Configure security rules

## Project Structure

```
career-guidance-platform/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── institute.js
│   │   ├── student.js
│   │   └── company.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── firebase/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── institute/
│   │   │   ├── student/
│   │   │   ├── company/
│   │   │   └── auth/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Key Features Implementation

### Email Verification
- Users receive verification emails upon registration
- Email verification is required before login

### Password Reset
- Forgot password functionality sends reset emails
- Reset links expire after 1 hour

### HEIS Results
- Students must manually enter their HEIS results
- System filters institutions and courses based on qualification

### Application Limits
- Maximum 2 course applications per institution
- System prevents duplicate applications

### Admission Selection
- If admitted to multiple institutions, student must select one
- Other admissions are automatically rejected
- First student from waiting list is moved to main list

### Job Matching
- System automatically matches students to job postings
- Matching based on:
  - Academic performance (GPA)
  - Extra certificates
  - Work experience
  - Relevance to job requirements
- Qualified students receive notifications

## Security Notes

- Never commit `serviceAccountKey.json` or `.env` files
- Use environment variables for sensitive data
- Implement proper Firestore security rules
- Use Firebase Authentication for user management

## Deployment

### Backend
Deploy to services like:
- Heroku
- AWS
- Google Cloud Platform
- Firebase Functions

### Frontend
Deploy to:
- Firebase Hosting
- Netlify
- Vercel

## Support

For issues or questions, please contact the development team.

