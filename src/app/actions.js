// Tell Next.js this file contains server-side code
"use server";

// Import function to add reviews to restaurants in Firestore
import { addReviewToRestaurant } from "@/src/lib/firebase/firestore.js";
// Import function to get authenticated Firebase app for server-side operations
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import Firestore database instance getter
import { getFirestore } from "firebase/firestore";

// This is a next.js server action, which is an alpha feature, so
// use with caution.
// https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
// Export async function to handle form submission for restaurant reviews
export async function handleReviewFormSubmission(data) {
  // Get authenticated Firebase app instance for server-side operations
  const { app } = await getAuthenticatedAppForUser();
  // Get Firestore database instance from the authenticated app
  const db = getFirestore(app);

  // Add the review to the restaurant in the database
  await addReviewToRestaurant(db, data.get("restaurantId"), {
          // Extract review text from form data
          text: data.get("text"),
          // Extract rating value from form data
          rating: data.get("rating"),

          // This came from a hidden form field.
          // Extract user ID from form data
          userId: data.get("userId"),
  });
}

