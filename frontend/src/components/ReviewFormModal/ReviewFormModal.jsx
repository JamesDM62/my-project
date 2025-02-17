import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createReview, fetchUserReviews, updateReview } from "../../store/reviews"; // ✅ Import updateReview
import { useModal } from "../../context/Modal";
import './ReviewForm.css';

const ReviewFormModal = ({ spotID, review: existingReview }) => {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    // If editing, prefill with existing review text & stars
    const [review, setReview] = useState("");
    const [stars, setStars] = useState(0);
    const [errors, setErrors] = useState({});
    const [hoveredStars, setHoveredStars] = useState(0);

    useEffect(() => {
        if(existingReview) {
            setReview(existingReview.review);
            setStars(existingReview.stars)
        }
    }, [existingReview]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const reviewData = { review, stars };

        let response;
        if (existingReview) {
            //  Update existing review instead of creating a new one
            response = await dispatch(updateReview(existingReview.id, reviewData));
        } else {
            response = await dispatch(createReview(spotID, reviewData));
        }

        if (response?.errors) {
            setErrors(response.errors);
        } else {
            dispatch(fetchUserReviews());
            closeModal();
        }
    };

    return (
        <div className="review-modal">
            <div className="review-box">
                <h2>{existingReview ? "Edit Your Review" : "How was your stay?"}</h2>

                {/* Display all error messages below the title */}
                {Object.values(errors).map((error, index) => (
                    <p key={index} className="error-review">{error}</p>
                ))}

                <textarea
                    placeholder="Leave your review here..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="review-textarea"
                />

                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= (hoveredStars || stars) ? "filled-star" : "empty-star"}`}
                            onMouseEnter={() => setHoveredStars(star)}
                            onMouseLeave={() => setHoveredStars(0)}
                            onClick={() => setStars(star)}
                        >
                            ★
                        </span>
                    ))}
                    <span className="star"> Stars</span>
                </div>

                <button
                    className="submit-review-button"
                    onClick={handleSubmit}
                    disabled={review.length < 10 || stars === 0}
                >
                    {existingReview ? "Update Review" : "Submit Your Review"}
                </button>
            </div>
        </div>
    );
}

export default ReviewFormModal;
