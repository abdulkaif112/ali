// Temporary Firebase configuration for CDN approach
declare global {
  interface Window {
    firebase: any;
  }
}

// Firebase configuration object
export const firebaseConfig = {
  apiKey: "AIzaSyDcvA8qcEheap8YkhCboRhTrFx0KYTwaCU",
  authDomain: "ali-enterprises-82dad.firebaseapp.com",
  projectId: "ali-enterprises-82dad",
  storageBucket: "ali-enterprises-82dad.firebasestorage.app",
  messagingSenderId: "714914859297",
  appId: "1:714914859297:web:acb723ed92e0dbf819d660",
  measurementId: "G-0KTNHK0NDD"
};

// Create Firebase instances
let firebaseApp: any = null;
let auth: any = null;
let analytics: any = null;

// Initialize Firebase when available
if (typeof window !== 'undefined') {
  // Wait for Firebase to load from CDN
  const initFirebase = () => {
    if (window.firebase) {
      try {
        firebaseApp = window.firebase.initializeApp(firebaseConfig);
        auth = window.firebase.auth();
        if (window.firebase.analytics) {
          analytics = window.firebase.analytics();
        }
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    }
  };
  
  // Try to initialize immediately or wait for load
  if (window.firebase) {
    initFirebase();
  } else {
    window.addEventListener('load', initFirebase);
  }
}

export { auth, analytics };
export default firebaseApp;