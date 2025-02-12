import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchManageSpots } from "../../../store/spots";
import { useNavigate } from "react-router-dom";
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
        <p>No spots found. Create one now!</p>
      </div>
    );
  }

  return (
    <div className="manage-spots-container">
      <h1>Manage Your Spots</h1>
      <button
        className="create-spot-button-manage"
        onClick={() => navigate("/spots/new")}
      >
        Create a New Spot
      </button>
      <div className="spots-grid">
        {spots.map((spot) => (
          <>
            <img
              className="spot-thumbnail"
              src={spot.previewImage || "https://via.placeholder.com/300"}
              alt={spot.name}
            />
            <div className="spots-info">
              <p className="city-state">
                {spot.city}, {spot.state}
              </p>
              <p className="star-rating">⭐ {spot.avgRating ? spot.avgRating.toFixed(1) : "No Rating"}</p>
            </div>
              <p className="spots-price">${spot.price} per night</p>
            <div className="spot-actions">
              <button
                className="update-spot-button"
                onClick={() => navigate(`/spots/${spot.id}/edit`)}
              >
                Update
              </button>
              <button
                className="delete-spot-button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this spot?")) {
                    // Dispatch delete action here
                  }
                }}
              >
                Delete
              </button>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}

export default ManageSpots;


