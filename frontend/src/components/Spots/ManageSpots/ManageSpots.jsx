import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchManageSpots } from "../../../store/spots";
import { useNavigate } from "react-router-dom";
import OpenModalButton from '../../OpenModalButton/OpenModalButton';
import DeleteSpotModal from '../../DeleteSpotModal/DeleteSpotModal';

import "./ManageSpots.css";

function ManageSpots() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const spots = useSelector((state) => state.spots.userSpots);

  useEffect(() => {
    dispatch(fetchManageSpots()); // Fetch spots from /api/spots/current
  }, [dispatch]);

  if (!spots || spots.length === 0) {
    return (
      <div className="manage-spots-container">
        <h1>Your Spots</h1>
        <button
        className="create-spot-button-manage"
        onClick={() => navigate("/spots/new")}
        >
          Create a New Spot
        </button>
        <p>No spots found. Create one now!</p>
      </div>
    );
  }

  return (
    <div className="manage-spots-container">
      <div className="manage-spots-header">
        <h1>Manage Spots</h1>
        <button
          className="create-spot-button-manage"
          onClick={() => navigate("/spots/new")}
        >
          Create a New Spot
        </button>
      </div>
      <div className="spots-grid">
        {spots.map((spot) => (
          <div
            key={spot.id} 
            className="spot-item" // ✅ (Optional) Add this for styling, but kept your structure
            onClick={() => navigate(`/spots/${spot.id}`)}
          >
            <img
              className="spot-thumbnail"
              src={spot.previewImage || "https://via.placeholder.com/300"}
              alt={spot.name}
            />
            <div className="spots-info">
              <p className="city-state">
                {spot.city}, {spot.state}
              </p>
              <div className="rating-info">
              {spot.avgRating && spot.avgRating > 0 ?(
                <p className="star-rating">⭐ {Number(spot.avgRating).toFixed(1)}</p>
              ) : (
                <p className="star-rating">⭐ <span className="new-rating">New</span></p>
              )}
        
              </div>
            </div>
              <p className="spots-price">${spot.price} per night</p>
            <div className="spot-actions">
              <button
                className="update-spot-button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/spots/${spot.id}/edit`);
                }}
              >
                Update
              </button>
              <div className="delete-button-wrapper" onClick={(e) => e.stopPropagation()}>
                <OpenModalButton
                  buttonText="Delete"
                  className="delete-spot-button"
                  modalComponent={<DeleteSpotModal spotId={spot.id} />}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>  
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageSpots;


