// Import Firebase authentication modules and functions
import {
  // Import Google authentication provider for Google sign-in
  GoogleAuthProvider,
  // Import popup-based sign-in function
  signInWithPopup,
  // Import auth state change listener with alias to avoid naming conflict
  onAuthStateChanged as _onAuthStateChanged,
  // Import ID token change listener with alias to avoid naming conflict
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

// Import the Firebase auth instance from client app configuration
import { auth } from "@/src/lib/firebase/clientApp";

// Export function to listen for authentication state changes
export function onAuthStateChanged(cb) {
  // Call Firebase's auth state change listener with auth instance and callback
  return _onAuthStateChanged(auth, cb);
}

// Export function to listen for ID token changes
export function onIdTokenChanged(cb) {
  // Call Firebase's ID token change listener with auth instance and callback
  return _onIdTokenChanged(auth, cb);
}

// Export async function to sign in with Google using popup
export async function signInWithGoogle() {
  // Create a new Google authentication provider instance
  const provider = new GoogleAuthProvider();

  // Try to authenticate with Google using popup method
  try {
    // Use Firebase's signInWithPopup method with auth instance and Google provider
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors that occur during Google sign-in
    console.error("Error signing in with Google", error);
  }
}

// Export async function to sign out the current user
export async function signOut() {
  // Try to sign out the current user
  try {
    // Call Firebase's signOut method on the auth instance
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during sign out
    console.error("Error signing out with Google", error);
  }
}