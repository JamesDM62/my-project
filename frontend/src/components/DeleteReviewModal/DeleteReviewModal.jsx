import { useDispatch } from "react-redux";
import { deleteReview } from "../../store/reviews";
import { useModal } from "../../context/Modal";
import "./DeleteReview.css";

const DeleteReviewModal = ({ reviewId, spotId }) => {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const handleDelete = async () => {
        await dispatch(deleteReview(reviewId, spotId));
        closeModal();
    };

    const yes = "Yes (Delete Review)";
    const no = "No (Keep Review)";

    return (
        <div className="delete-review-modal">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this review?</p>
            <button className="delete-review-button" onClick={handleDelete}>
                {yes}
            </button>
            <button className="cancel-review-button" onClick={closeModal}>
                {no}
            </button>
        </div>
    );
}

export default DeleteReviewModal;