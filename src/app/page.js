// Import the RestaurantListings component from the components directory
import RestaurantListings from "@/src/components/RestaurantListings.jsx";
// Import the getRestaurants function from the Firebase Firestore utilities
import { getRestaurants } from "@/src/lib/firebase/firestore.js";
// Import the getAuthenticatedAppForUser function for server-side Firebase authentication
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";
// Import getFirestore function from Firebase Firestore SDK
import { getFirestore } from "firebase/firestore";

// Force next.js to treat this route as server-side rendered
// Without this line, during the build process, next.js will treat this route as static and build a static HTML file for it

// Export a configuration object that forces this page to be dynamically rendered on each request
export const dynamic = "force-dynamic";

// This line also forces this route to be server-side rendered
// export const revalidate = 0;

// Define the default export as an async function component called Home that receives props
export default async function Home(props) {
  // Extract searchParams from props and await it (searchParams is a Promise in Next.js 13+)
  const searchParams = await props.searchParams;
  // Using seachParams which Next.js provides, allows the filtering to happen on the server-side, for example:
  // ?city=London&category=Indian&sort=Review
  // Call getAuthenticatedAppForUser to get the Firebase server app instance and destructure firebaseServerApp
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  // Call getRestaurants with the Firestore instance and search parameters to fetch restaurant data
  const restaurants = await getRestaurants(
    getFirestore(firebaseServerApp),
    searchParams
  );
  // Return JSX that renders the main content area
  return (
    <main className="main__home">
      <RestaurantListings
        initialRestaurants={restaurants}
        searchParams={searchParams}
      />
    </main>
  );
}
