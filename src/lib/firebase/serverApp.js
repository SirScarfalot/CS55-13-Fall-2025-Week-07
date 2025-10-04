// enforces that this code can only be called on the server
// https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
// Import the server-only module to prevent this code from running on the client side
import "server-only";

// Import the cookies function from Next.js headers to access server-side cookies
import { cookies } from "next/headers";
// Import Firebase app initialization functions for both regular and server-side apps
import { initializeServerApp, initializeApp } from "firebase/app";

// Import the getAuth function to access Firebase Authentication
import { getAuth } from "firebase/auth";

// Returns an authenticated client SDK instance for use in Server Side Rendering
// and Static Site Generation
// Export an async function that creates an authenticated Firebase app for server-side use
export async function getAuthenticatedAppForUser() {
  // Retrieve the authentication ID token from the __session cookie stored in the browser
  const authIdToken = (await cookies()).get("__session")?.value;

  // Firebase Server App is a new feature in the JS SDK that allows you to
  // instantiate the SDK with credentials retrieved from the client & has
  // other affordances for use in server environments.
  // Initialize a Firebase server app with the ID token for authentication
  const firebaseServerApp = initializeServerApp(
    // https://github.com/firebase/firebase-js-sdk/issues/8863#issuecomment-2751401913
    // First create a base Firebase app instance
    initializeApp(),
    // Pass configuration object containing the authentication ID token
    {
      authIdToken,
    }
  );

  // Get the authentication service from the Firebase server app
  const auth = getAuth(firebaseServerApp);
  // Wait for the authentication state to be ready before proceeding
  await auth.authStateReady();

  // Return both the Firebase server app instance and the current authenticated user
  return { firebaseServerApp, currentUser: auth.currentUser };
}
