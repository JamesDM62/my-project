import { useDispatch } from 'react-redux';
import { deleteSpot } from '../../store/spots';
import { useModal } from '../../context/Modal';
import './DeleteSpot.css';

function DeleteSpotModal({ spotId }) {
    const dispatch = useDispatch();
    const { closeModal } = useModal();

    const handleDelete = async () => {
        await dispatch(deleteSpot(spotId));
        closeModal();
    };

    const yes = "Yes (Delete Spot)";
    const no = "No (Keep Spot)";


    return (
        <div className="delete-spot-modal"> {/* Main wrapper */}
            <div className="modal-content">
                <h2 className="modal-title">Confirm Delete</h2>
                <p className="modal-text">Are you sure you want to remove this spot?</p>
                <div className="modal-buttons">
                    <button className="confirm-delete-button" onClick={handleDelete}>
                        {yes}
                    </button>
                    <button className="cancel-delete-button" onClick={closeModal}>
                        {no}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteSpotModal;