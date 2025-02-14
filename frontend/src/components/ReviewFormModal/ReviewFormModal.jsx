import { useState } from "react";
import { useDispatch } from "react-redux";
import { createReview } from "../../store/reviews";
import { useModal } from "../../context/Modal";
import './ReviewForm.css';

const ReviewFormModal = ({ spotID }) => {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const [review, setReview] = useState("");
    const [stars, setStars] = useState(0);
    const [errors, setErrors] = useState({});
    const [hoveredStars, setHoveredStars] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const reviewData = { review, stars };
        const response = await dispatch(createReview(spotID, reviewData));

        if (response?.errors) {
            setErrors(response.errors);
        } else {
            closeModal();
        }
    };

    return (
        <div className="review-modal">
            <div className="review-box">
                <h2>How was your stay?</h2>

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
                    Submit Your Review
                </button>
            </div>
        </div>
    );
}

export default ReviewFormModal;