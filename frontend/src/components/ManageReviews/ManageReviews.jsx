import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserReviews } from "../../store/reviews"; // ✅ Create this action
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import DeleteReviewModal from "../DeleteReviewModal/DeleteReviewModal";
import ReviewFormModal from "../ReviewFormModal/ReviewFormModal";
import './ManageReviews.css';

function ManageReviews() {
    const dispatch = useDispatch();
    const userReviews = useSelector(state => state.reviews.userReviews);

    useEffect(() => {
        dispatch(fetchUserReviews());
    }, [dispatch]);

    if (!userReviews || userReviews.length === 0) {
        return <p>You have not posted any reviews yet.</p>;
    }

    return (
        <div className="manage-reviews-container">
            <h1>Manage Reviews</h1>
            <div className="reviews-grid">
               {userReviews.map(review => (
                <div key={review.id} className="review-card">
                    <p className="review-spot">{review.Spot.name}</p>
                    <p className="manage-review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                        })}
                    </p>
                    <p className="review-text">{review.review}</p>
                    <div className="review-buttons">
                        <OpenModalButton
                            buttonText="Update"
                            className="update-review-button"
                            modalComponent={<ReviewFormModal spotId={review.spotId} review={review} />}
                        />
                        <OpenModalButton
                            buttonText="Delete"
                            className="delete-review-button"
                            modalComponent={<DeleteReviewModal reviewId={review.id} />}
                        />
                    </div>
                </div>
               ))}
            </div>
        </div> 
    );
}

export default ManageReviews;