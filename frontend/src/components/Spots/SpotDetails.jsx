import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchSpotDetails } from "../../store/spots";
import { fetchSpotReviews } from "../../store/reviews";
import { RxDotFilled } from "react-icons/rx";
import './SpotDetails.css';

function SpotDetails() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector((state) => state.spots.singleSpot);
  const reviews = useSelector(
    (state) => state.reviews[spotId] || [],
    (prev, next) => prev.length === next.length
  );

  useEffect(() => {
    dispatch(fetchSpotDetails(spotId));
    dispatch(fetchSpotReviews(spotId));
  }, [dispatch, spotId]);

  if (!spot) return <p>Loading...</p>;

  const imageUrl =
  spot.previewImage || // Try the original logic
  (spot.SpotImages?.find((img) => img.previewImage)?.url || // Use the image with previewImage: true
  (spot.SpotImages?.length ? spot.SpotImages[0].url : null)); // Fallback to the first image

  return (
    <div className="spot-details-container">
      {/* Header Section */}
        <div className="spot-header">
            <h1 className="spot-name">{spot.name}</h1>
            <p className="spot-location">{spot.city}, {spot.state}, {spot.country}</p>
        </div>
  
      {/* Images Section */}
        <div className="spot-images">
            <div className="main-image">
                <img src={imageUrl} alt={spot.name} />
            </div>
        {/* <div className="other-images">
          {spot.SpotImages.slice(1, 5).map((image) => (
            <img key={image.id} src={image.url} alt={`${spot.name} additional`} />
          ))}
        </div> */}
            <div className="other-images">
                { [...Array(4)].map((_, idx) => (
                <img
                    key={idx}
                    src={`https://source.unsplash.com/random/400x400?sig=${idx}`}
                    alt={`Placeholder ${idx + 1}`}
                />
                ))}
            </div>

        </div>
  
      {/* Host Info */}
      <div className="host-info">
        <p>Hosted by {spot.Owner.firstName} {spot.Owner.lastName}</p>
        <p className="spot-description">{spot.description}</p>
      </div>
  
      {/* Reserve Button */}
      <div className="reserve-button-container">
        <div className="price-and-rating">
            <p className="price-amount">${spot.price} <span>night</span></p>
            <div className="rating-info">
                <p className="star-rating">⭐ {spot.avgStarRating.toFixed(1)}</p>
                <span className="dot"><RxDotFilled /></span> 
                <p className="review-count">{spot.numReviews} {spot.numReviews === 1 ? "Review" : "Reviews"}</p>
            </div>
        </div>
        <button className="reserve-button" onClick={() => alert("Feature Coming Soon...")}>
            Reserve
        </button>
      </div>

      <hr className="divider" />
  
      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
            <p className="average-rating">⭐ {spot.avgStarRating.toFixed(1)}</p>
            <span className="dot"><RxDotFilled /></span> 
            <p className="total-reviews">{spot.numReviews} {spot.numReviews === 1 ? "Review" : "Reviews"}</p>
        </div>
        {reviews.length > 0 ? (
          [...reviews]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort newest to oldest
          .map((review) => (
            <div key={review.id} className="review">
              <p className="review-author">
                <strong>{review.User?.firstName || "Unknown User"}</strong>
              </p> 
              <p className="review-date">
                {new Date(review.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long'})}
              </p>
              <p className="review-text">{review.review}</p>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>
  );
  
  
}

export default SpotDetails;
