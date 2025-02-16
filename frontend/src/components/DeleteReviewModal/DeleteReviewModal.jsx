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
            <div className="delete-review-content">
                <h2 className="delete-modal-title">Confirm Delete</h2>
                <p className="delete-modal-text">Are you sure you want to delete this review?</p>
                <div className="delete-modal-buttons">
                    <button className="delete-review-modal-button" onClick={handleDelete}>
                        {yes}
                    </button>
                    <button className="cancel-review-button" onClick={closeModal}>
                        {no}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteReviewModal;