// Import Firebase Storage functions for file operations
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Import the Firebase Storage instance from client configuration
import { storage } from "@/src/lib/firebase/clientApp";

// Import function to update restaurant document with image URL
import { updateRestaurantImageReference } from "@/src/lib/firebase/firestore";

// Main function to handle restaurant image updates
export async function updateRestaurantImage(restaurantId, image) {
  // Wrap operations in try-catch for error handling
  try {
    // Validate that restaurant ID is provided
    if (!restaurantId) {
      // Throw error if no restaurant ID
      throw new Error("No restaurant ID has been provided.");
    }

    // Validate that image file is provided and has a name
    if (!image || !image.name) {
      // Throw error if image is invalid
      throw new Error("A valid image has not been provided.");
    }

    // Upload image to Firebase Storage and get public URL
    const publicImageUrl = await uploadImage(restaurantId, image);
    // Update restaurant document in Firestore with the new image URL
    await updateRestaurantImageReference(restaurantId, publicImageUrl);

    // Return the public URL for the uploaded image
    return publicImageUrl;
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error processing request:", error);
  }
}

// Helper function to upload image file to Firebase Storage
async function uploadImage(restaurantId, image) {
  // Create file path using restaurant ID and image name
  const filePath = `images/${restaurantId}/${image.name}`;
  // Create a reference to the storage location
  const newImageRef = ref(storage, filePath);
  // Upload the image file to Firebase Storage
  await uploadBytesResumable(newImageRef, image);

  // Get and return the public download URL for the uploaded image
  return await getDownloadURL(newImageRef);
}
