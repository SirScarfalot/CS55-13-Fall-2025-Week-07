// Import the function to generate fake restaurant and review data
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

// Import Firebase Firestore functions for database operations
import {
  // Function to reference a collection in Firestore
  collection,
  // Function to listen for real-time updates to a query
  onSnapshot,
  // Function to create a query for filtering and sorting data
  query,
  // Function to get documents from a collection once
  getDocs,
  // Function to reference a specific document
  doc,
  // Function to get a single document once
  getDoc,
  // Function to update an existing document
  updateDoc,
  // Function to order query results by a field
  orderBy,
  // Firebase timestamp type
  Timestamp,
  // Function to run database operations in a transaction
  runTransaction,
  // Function to filter query results by field values
  where,
  // Function to add a new document to a collection
  addDoc,
  // Function to get Firestore database instance
  getFirestore,
} from "firebase/firestore";

// Import the database instance from the client app configuration
import { db } from "@/src/lib/firebase/clientApp";

// Function to update a restaurant's image URL in the database
export async function updateRestaurantImageReference(
  restaurantId,
  publicImageUrl
) {
  // Create a reference to the specific restaurant document
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);
  // Check if the restaurant reference exists
  if (restaurantRef) {
    // Update the restaurant document with the new photo URL
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

const updateWithRating = async (
  transaction,
  docRef,
  newRatingDocument,
  review
) => {
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()),
  });
};

export async function addReviewToRestaurant(db, restaurantId, review) {
  if (!restaurantId) {
          throw new Error("No restaurant ID has been provided.");
  }

  if (!review) {
          throw new Error("A valid review has not been provided.");
  }

  try {
          const docRef = doc(collection(db, "restaurants"), restaurantId);
          const newRatingDocument = doc(
                  collection(db, `restaurants/${restaurantId}/ratings`)
          );

          // corrected line
          await runTransaction(db, transaction =>
                  updateWithRating(transaction, docRef, newRatingDocument, review)
          );
  } catch (error) {
          console.error(
                  "There was an error adding the rating to the restaurant",
                  error
          );
          throw error;
  }
}

// Helper function to apply filters to a Firestore query
function applyQueryFilters(q, { category, city, price, sort }) {
  // Add category filter if specified
  if (category) {
    // Filter restaurants by exact category match
    q = query(q, where("category", "==", category));
  }
  // Add city filter if specified
  if (city) {
    // Filter restaurants by exact city match
    q = query(q, where("city", "==", city));
  }
  // Add price filter if specified
  if (price) {
    // Filter restaurants by price level (length of price string)
    q = query(q, where("price", "==", price.length));
  }
  // Apply sorting based on sort parameter
  if (sort === "Rating" || !sort) {
    // Sort by average rating in descending order (highest first)
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    // Sort by number of ratings in descending order (most reviews first)
    q = query(q, orderBy("numRatings", "desc"));
  }
  // Return the modified query with all filters applied
  return q;
}

// Function to get restaurants from the database with optional filters
export async function getRestaurants(db = db, filters = {}) {
  // Create a query for the restaurants collection
  let q = query(collection(db, "restaurants"));

  // Apply any filters to the query
  q = applyQueryFilters(q, filters);
  // Execute the query and get all matching documents
  const results = await getDocs(q);
  // Transform the results into a more usable format
  return results.docs.map((doc) => {
    return {
      // Include the document ID
      id: doc.id,
      // Spread all the document data
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert Firestore timestamp to JavaScript Date object
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Function to get restaurants with real-time updates using a callback
export function getRestaurantsSnapshot(cb, filters = {}) {
  // Validate that the callback is actually a function
  if (typeof cb !== "function") {
    // Log error if callback is not a function
    console.log("Error: The callback parameter is not a function");
    // Exit the function early
    return;
  }

  // Create a query for the restaurants collection
  let q = query(collection(db, "restaurants"));
  // Apply any filters to the query
  q = applyQueryFilters(q, filters);

  // Set up real-time listener that calls the callback whenever data changes
  return onSnapshot(q, (querySnapshot) => {
    // Transform the query results into a usable format
    const results = querySnapshot.docs.map((doc) => {
      return {
        // Include the document ID
        id: doc.id,
        // Spread all the document data
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore timestamp to JavaScript Date object
        timestamp: doc.data().timestamp.toDate(),
      };
    });

    // Call the provided callback with the transformed results
    cb(results);
  });
}


// Function to get a single restaurant by its ID
export async function getRestaurantById(db, restaurantId) {
  // Validate that restaurantId is provided
  if (!restaurantId) {
    // Log error if ID is missing or invalid
    console.log("Error: Invalid ID received: ", restaurantId);
    // Exit the function early
    return;
  }
  // Create a reference to the specific restaurant document
  const docRef = doc(db, "restaurants", restaurantId);
  // Get the document data once
  const docSnap = await getDoc(docRef);
  // Return the document data with converted timestamp
  return {
    // Spread all the document data
    ...docSnap.data(),
    // Convert Firestore timestamp to JavaScript Date object
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

// Placeholder function for getting restaurant with real-time updates (currently empty)
export function getRestaurantSnapshotById(restaurantId, cb) {
  // Return nothing (function not implemented yet)
  return;
}

// Function to get all reviews for a specific restaurant
export async function getReviewsByRestaurantId(db, restaurantId) {
  // Validate that restaurantId is provided
  if (!restaurantId) {
    // Log error if restaurant ID is missing or invalid
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Exit the function early
    return;
  }

  // Create a query for the ratings subcollection, ordered by timestamp
  const q = query(
    // Reference the ratings subcollection for this restaurant
    collection(db, "restaurants", restaurantId, "ratings"),
    // Order reviews by timestamp in descending order (newest first)
    orderBy("timestamp", "desc")
  );

  // Execute the query and get all matching documents
  const results = await getDocs(q);
  // Transform the results into a more usable format
  return results.docs.map((doc) => {
    return {
      // Include the document ID
      id: doc.id,
      // Spread all the document data
      ...doc.data(),
      // Only plain objects can be passed to Client Components from Server Components
      // Convert Firestore timestamp to JavaScript Date object
      timestamp: doc.data().timestamp.toDate(),
    };
  });
}

// Function to get reviews with real-time updates using a callback
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  // Validate that restaurantId is provided
  if (!restaurantId) {
    // Log error if restaurant ID is missing or invalid
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    // Exit the function early
    return;
  }

  // Create a query for the ratings subcollection, ordered by timestamp
  const q = query(
    // Reference the ratings subcollection for this restaurant
    collection(db, "restaurants", restaurantId, "ratings"),
    // Order reviews by timestamp in descending order (newest first)
    orderBy("timestamp", "desc")
  );
  // Set up real-time listener that calls the callback whenever data changes
  return onSnapshot(q, (querySnapshot) => {
    // Transform the query results into a usable format
    const results = querySnapshot.docs.map((doc) => {
      return {
        // Include the document ID
        id: doc.id,
        // Spread all the document data
        ...doc.data(),
        // Only plain objects can be passed to Client Components from Server Components
        // Convert Firestore timestamp to JavaScript Date object
        timestamp: doc.data().timestamp.toDate(),
      };
    });
    // Call the provided callback with the transformed results
    cb(results);
  });
}

// Function to add fake restaurants and reviews to the database for testing
export async function addFakeRestaurantsAndReviews() {
  // Generate fake restaurant and review data
  const data = await generateFakeRestaurantsAndReviews();
  // Loop through each restaurant and its reviews
  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add the restaurant document to the restaurants collection
      const docRef = await addDoc(
        collection(db, "restaurants"),
        restaurantData
      );

      // Loop through each rating/review for this restaurant
      for (const ratingData of ratingsData) {
        // Add each rating document to the restaurant's ratings subcollection
        await addDoc(
          collection(db, "restaurants", docRef.id, "ratings"),
          ratingData
        );
      }
    } catch (e) {
      // Log error message if document addition fails
      console.log("There was an error adding the document");
      // Log the actual error details
      console.error("Error adding document: ", e);
    }
  }
}
