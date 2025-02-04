import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSpots } from "../../store/spots"; // Ensure you create this in Redux
import SpotCard from "./SpotCard"; // You will create this next
import "./SpotList.css"; // Create this file for styling

function SpotList() {
  const dispatch = useDispatch();
  const spots = useSelector((state) => state.spots.allSpots); // Adjust according to your Redux state

  useEffect(() => {
    dispatch(fetchSpots()); // Fetch spots from the backend
  }, [dispatch]);

  if (!spots) return <p>Loading...</p>;

  return (
    <div className="spot-list">
      {Object.values(spots).map((spot) => (
        <SpotCard key={spot.id} spot={spot} />
      ))}
    </div>
  );
}

export default SpotList;
