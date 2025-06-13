# Firebase Configuration Setup

## Overview

The Pixel Paper Plane game uses Firebase Authentication for user management and Firestore for cloud score storage. This document explains how to configure Firebase for both development and production environments.

## Firebase Project Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or use existing project `paper-plane-c713f`
   - Enable Authentication and Firestore Database

2. **Enable Authentication Methods**
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" 
   - Enable "Anonymous" for guest accounts

3. **Configure Firestore Database**
   - Go to Firestore Database
   - Create database in test mode (or production mode with rules)
   - The app will create collections automatically

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=paper-plane-c713f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=paper-plane-c713f
VITE_FIREBASE_STORAGE_BUCKET=paper-plane-c713f.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Optional: Firebase Emulator (for development)
VITE_FIREBASE_USE_EMULATOR=false
```

**Quick Setup for Development:**

If you want to test the authentication flow immediately without setting up Firebase:

1. The app will automatically run in **local development mode** when Firebase is not configured
2. Authentication will work with mock data (login/register will succeed with any email/password)
3. You'll see console warnings indicating local mode is active
4. This is perfect for testing UI and basic functionality

**For Full Firebase Integration:**

1. Set up a Firebase project (see instructions below)
2. Create the `.env.local` file with your Firebase configuration
3. Restart the development server (`npm run dev`)
4. The app will automatically switch to Firebase mode

### Getting Firebase Configuration Values

1. Go to Firebase Console > Project Settings
2. Scroll down to "Your apps" section
3. Click on the web app (</>) icon or "Add app" if none exists
4. Copy the configuration values from the `firebaseConfig` object

### Development vs Production

**Development:**
- Use `.env.local` for local development
- Can optionally use Firebase Emulator Suite
- Set `VITE_FIREBASE_USE_EMULATOR=true` to use emulator

**Production:**
- Environment variables should be set in your hosting platform
- For Vercel: Use Project Settings > Environment Variables
- For Firebase Hosting: Use `firebase functions:config:set`

## Security Configuration

### Firestore Security Rules

Create proper security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scores are readable by anyone, writable by authenticated users
    match /scores/{scoreId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Global leaderboards are readable by all
    match /leaderboards/{document=**} {
      allow read: if true;
      allow write: if false; // Managed by Cloud Functions
    }
  }
}
```

### Firebase Authentication Rules

- **Anonymous Authentication**: Enabled for guest accounts
- **Email/Password**: Enabled for permanent accounts
- **Account Linking**: Allows upgrading anonymous accounts to permanent accounts

## Testing Configuration

### Firebase Emulator Suite (Optional)

For local development with emulators:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize emulators: `firebase init emulators`
4. Start emulators: `firebase emulators:start`
5. Set `VITE_FIREBASE_USE_EMULATOR=true` in `.env.local`

### Verification

To verify Firebase is configured correctly:

1. Start the development server: `npm run dev`
2. Open browser console
3. Look for "Firebase Auth initialized successfully" message
4. Try creating a guest account - should see Firebase UID format
5. Try registering with email/password

## Troubleshooting

### Common Issues

1. **"Firebase not initialized"**
   - Check that all environment variables are set
   - Verify VITE_ prefix is used (required for Vite)
   - Restart development server after adding variables

2. **"auth/operation-not-allowed"**
   - Enable Email/Password and Anonymous auth in Firebase Console
   - Check Firebase project configuration

3. **Permission denied errors**
   - Verify Firestore security rules
   - Check that user is properly authenticated

4. **Network errors in development**
   - Check if Firebase emulator is running when `VITE_FIREBASE_USE_EMULATOR=true`
   - Verify internet connection for production Firebase

### Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Troubleshooting](https://firebase.google.com/docs/auth/troubleshooting)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## Current Configuration Status

- ✅ Firebase project exists (`paper-plane-c713f`)
- ✅ AuthManager implements Firebase integration
- ✅ LoginScene provides authentication UI
- ⚠️  Environment variables need to be configured
- ⚠️  Authentication methods need to be enabled in Firebase Console
- ⚠️  Firestore security rules need to be deployed 