// Tells Next.js that this component should run on the client side
"use client";

// This components handles the review dialog and uses a next.js feature known as Server Actions to handle the form submission

// Import React hooks for component lifecycle and DOM manipulation
import { useEffect, useLayoutEffect, useRef } from "react";
// Import the RatingPicker component for star rating selection
import RatingPicker from "@/src/components/RatingPicker.jsx";
// Import the server action function for handling form submission
import { handleReviewFormSubmission } from "@/src/app/actions.js";

// Define the ReviewDialog component with destructured props
const ReviewDialog = ({
  // Boolean flag indicating if the dialog is open
  isOpen,
  // Function to close the dialog
  handleClose,
  // Review object containing current review data
  review,
  // Function to update review state when inputs change
  onChange,
  // ID of the current user
  userId,
  // ID of the restaurant being reviewed
  id,
}) => {
  // Create a ref to access the dialog DOM element
  const dialog = useRef();

  // dialogs only render their backdrop when called with `showModal`
  // Effect that runs synchronously after DOM mutations to control dialog visibility
  useLayoutEffect(() => {
    // Check if the dialog should be open
    if (isOpen) {
      // Display the dialog with modal backdrop
      dialog.current.showModal();
    } else {
      // Hide the dialog
      dialog.current.close();
    }
  }, [isOpen, dialog]);

  // Event handler for mouse clicks on the dialog
  const handleClick = (e) => {
    // close if clicked outside the modal
    // Check if the click target is the dialog backdrop (not the content)
    if (e.target === dialog.current) {
      // Close the dialog when clicking outside
      handleClose();
    }
  };

  // Return the JSX structure for the dialog component
  return (
    // Create a dialog element with ref and click handler
    <dialog ref={dialog} onMouseDown={handleClick}>
      // Create a form that submits to the server action
      <form
        // Set the server action to handle form submission
        action={handleReviewFormSubmission}
        // Close dialog when form is submitted
        onSubmit={() => {
          handleClose();
        }}
      >
        // Dialog header section
        <header>
          // Dialog title
          <h3>Add your review</h3>
        </header>
        // Dialog main content section
        <article>
          // Rating picker component for star selection
          <RatingPicker />

          // Paragraph containing text input
          <p>
            // Text input for review content
            <input
              // Set input type to text
              type="text"
              // Name attribute for form data
              name="text"
              // ID for accessibility
              id="review"
              // Placeholder text
              placeholder="Write your thoughts here"
              // Make field required
              required
              // Bind input value to review text
              value={review.text}
              // Handle text changes and update state
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          // Hidden input to pass restaurant ID to form
          <input type="hidden" name="restaurantId" value={id} />
          // Hidden input to pass user ID to form
          <input type="hidden" name="userId" value={userId} />
        </article>
        // Dialog footer with action buttons
        <footer>
          // Menu container for buttons
          <menu>
            // Cancel button
            <button
              // Automatically focus this button
              autoFocus
              // Button type to reset form
              type="reset"
              // Close dialog when clicked
              onClick={handleClose}
              // Apply cancel button styling
              className="button--cancel"
            >
              Cancel
            </button>
            // Submit button
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

// Export the component as default export
export default ReviewDialog;
