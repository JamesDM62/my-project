const LOAD_SPOTS = "spots/LOAD_SPOTS";
const LOAD_SPOT_DETAILS = "spots/LOAD_SPOT_DETAILS";

export const loadSpots = (spots) => ({
  type: LOAD_SPOTS,
  spots,
});

export const loadSpotDetails = (spot) => ({
  type: LOAD_SPOT_DETAILS,
  spot,
});

export const fetchSpots = () => async (dispatch) => {
  const response = await fetch("/api/spots"); // Ensure this endpoint exists in your backend
  if (response.ok) {
    const data = await response.json();
    dispatch(loadSpots(data.Spots));
  }
};

export const fetchSpotDetails = (spotId) => async (dispatch) => {
  const response = await fetch(`/api/spots/${spotId}`);
  if (response.ok) {
    const spot = await response.json();
    dispatch(loadSpotDetails(spot));
  }
};

const initialState = { allSpots: {}, singleSpot: null };

export default function spotsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_SPOTS:
      return { ...state, allSpots: action.spots };
    case LOAD_SPOT_DETAILS:
      return { ...state, singleSpot: action.spot };
    default:
      return state;
  }
}
