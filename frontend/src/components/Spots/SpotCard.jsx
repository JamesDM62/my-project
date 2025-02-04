import { useNavigate } from "react-router-dom";
import "./SpotCard.css";

function SpotCard({ spot }) {
  const navigate = useNavigate();

  // Determine star rating display
  let starRating = spot.avgRating > 0 ? spot.avgRating.toFixed(2) : "New";

  return (
    <div className="spot-card" onClick={() => navigate(`/spots/${spot.id}`)}>
      {/* Image */}
      <div className="spot-image-container">
        <img src={spot.previewImage} alt={spot.name} className="spot-image" />
        <span className="tooltip">{spot.name}</span> {/* Tooltip on hover */}
      </div>

      {/* Spot Info */}
      <div className="spot-info">
        <div className="spot-header">
          <p className="spot-location">{spot.city}, {spot.state}</p>
          <p className="spot-rating">⭐ {starRating}</p> 
        </div>
        <p className="spot-price">${spot.price} <span className="per-night">night</span></p>
      </div>
    </div>
  );
}

export default SpotCard;

