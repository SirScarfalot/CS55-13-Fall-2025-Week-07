// Directive to mark this component as a client-side component in Next.js
"use client";
// Import React and the useEffect hook for managing component lifecycle
import React, { useEffect } from "react";
// Import Next.js Link component for client-side navigation
import Link from "next/link";
// Import Firebase authentication functions
import {
  signInWithGoogle, // Function to sign in with Google OAuth
  signOut, // Function to sign out the current user
  onIdTokenChanged, // Function to listen for authentication state changes
} from "@/src/lib/firebase/auth.js";
// Import function to add fake restaurant data for testing
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";
// Import cookie management functions
import { setCookie, deleteCookie } from "cookies-next";

// Custom hook to manage user session state and authentication
function useUserSession(initialUser) {
  // Set up effect to run when component mounts or initialUser changes
  useEffect(() => {
    // Return the cleanup function from onIdTokenChanged
    return onIdTokenChanged(async (user) => {
      // If user is authenticated
      if (user) {
        // Get the user's ID token for authentication
        const idToken = await user.getIdToken();
        // Set the session cookie with the ID token
        await setCookie("__session", idToken);
      } else {
        // If user is not authenticated, delete the session cookie
        await deleteCookie("__session");
      }
      // If the initial user and current user are the same, don't reload
      if (initialUser?.uid === user?.uid) {
        return;
      }
      // Reload the page to update the UI with new authentication state
      window.location.reload();
    });
  }, [initialUser]); // Dependency array - effect runs when initialUser changes

  // Return the initial user object
  return initialUser;
}

// Main Header component that displays navigation and user authentication UI
export default function Header({ initialUser }) {
  // Get the current user from the custom hook
  const user = useUserSession(initialUser);

  // Event handler for sign out button click
  const handleSignOut = (event) => {
    // Prevent the default link behavior
    event.preventDefault();
    // Call the sign out function
    signOut();
  };

  // Event handler for sign in button click
  const handleSignIn = (event) => {
    // Prevent the default link behavior
    event.preventDefault();
    // Call the Google sign in function
    signInWithGoogle();
  };

  // Return the JSX for the header component
  return (
    // Header element with semantic HTML
    <header>
      {/* Link to home page with logo styling */}
      <Link href="/" className="logo">
        {/* Display the FriendlyEats logo image */}
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        {/* Display the Friendly Eats text */}
        Friendly Eats
      </Link>
      {/* Conditional rendering based on user authentication status */}
      {user ? (
        // If user is authenticated, show user profile section
        <>
          {/* Container for user profile information */}
          <div className="profile">
            {/* Paragraph containing user profile image and name */}
            <p>
              {/* User profile image with fallback to default profile icon */}
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {/* Display the user's display name */}
              {user.displayName}
            </p>

            {/* Dropdown menu container */}
            <div className="menu">
              {/* Menu indicator (ellipsis) */}
              ...
              {/* Unordered list of menu items */}
              <ul>
                {/* Menu item showing user's display name */}
                <li>{user.displayName}</li>

                {/* Menu item for adding sample restaurants */}
                <li>
                  {/* Link to add fake restaurant data */}
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                {/* Menu item for signing out */}
                <li>
                  {/* Link to sign out with click handler */}
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        // If user is not authenticated, show sign in section
        <div className="profile">
          {/* Link to sign in with Google */}
          <a href="#" onClick={handleSignIn}>
            {/* Default profile icon for unauthenticated users */}
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
