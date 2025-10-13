// Enable client-side rendering for this component
"use client";

// This components shows one individual restaurant
// It receives data from src/app/restaurant/[id]/page.jsx

// Import React hooks for state management and side effects
import { React, useState, useEffect, Suspense } from "react";
// Import Next.js dynamic import for code splitting
import dynamic from "next/dynamic";
// Import function to get real-time restaurant data from Firestore
import { getRestaurantSnapshotById } from "@/src/lib/firebase/firestore.js";
// Import custom hook to get current user information
import { useUser } from "@/src/lib/getUser";
// Import component to display restaurant details
import RestaurantDetails from "@/src/components/RestaurantDetails.jsx";
// Import function to upload restaurant images to Firebase Storage
import { updateRestaurantImage } from "@/src/lib/firebase/storage.js";

// Dynamically import ReviewDialog component for code splitting
const ReviewDialog = dynamic(() => import("@/src/components/ReviewDialog.jsx"));

// Define the main Restaurant component with props
export default function Restaurant({
  id,
  initialRestaurant,
  initialUserId,
  children,
}) {
  // State to store current restaurant details
  const [restaurantDetails, setRestaurantDetails] = useState(initialRestaurant);
  // State to control whether review dialog is open
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a review with the user, and to know whether to show the review dialog
  // Get current user ID, fallback to initialUserId if not available
  const userId = useUser()?.uid || initialUserId;
  // State to store review form data (rating and text)
  const [review, setReview] = useState({
    rating: 0,
    text: "",
  });

  // Function to handle changes in review form fields
  const onChange = (value, name) => {
    // Update review state with new value for the specified field
    setReview({ ...review, [name]: value });
  };

  // Async function to handle restaurant image upload
  async function handleRestaurantImage(target) {
    // Extract the first file from the input target
    const image = target.files ? target.files[0] : null;
    // Exit early if no image file is selected
    if (!image) {
      return;
    }

    // Upload image to Firebase Storage and get back the URL
    const imageURL = await updateRestaurantImage(id, image);
    // Update restaurant details state with new image URL
    setRestaurantDetails({ ...restaurantDetails, photo: imageURL });
  }

  // Function to handle closing the review dialog
  const handleClose = () => {
    // Close the review dialog
    setIsOpen(false);
    // Reset review form to default values
    setReview({ rating: 0, text: "" });
  };

  // Effect hook to set up real-time listener for restaurant data
  useEffect(() => {
    // Return the cleanup function from the snapshot listener
    return getRestaurantSnapshotById(id, (data) => {
      // Update restaurant details when data changes
      setRestaurantDetails(data);
    });
  }, [id]);

  // Render the component JSX
  return (
    <>
      {/* Render restaurant details component with props */}
      <RestaurantDetails
        restaurant={restaurantDetails}
        userId={userId}
        handleRestaurantImage={handleRestaurantImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {/* Render any child components */}
        {children}
      </RestaurantDetails>
      {/* Conditionally render review dialog only if user is logged in */}
      {userId && (
        // Wrap in Suspense for lazy loading with fallback
        <Suspense fallback={<p>Loading...</p>}>
          {/* Render review dialog component with props */}
          <ReviewDialog
            isOpen={isOpen}
            handleClose={handleClose}
            review={review}
            onChange={onChange}
            userId={userId}
            id={id}
          />
        </Suspense>
      )}
    </>
  );
}
