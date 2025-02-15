const LOAD_SPOTS = "spots/LOAD_SPOTS";
const LOAD_SPOT_DETAILS = "spots/LOAD_SPOT_DETAILS";
const SET_USER_SPOTS = "spots/SET_USER_SPOTS";
const DELETE_SPOT = "spots/DELETE_SPOT";

export const loadSpots = (spots) => ({
  type: LOAD_SPOTS,
  spots,
});

export const loadSpotDetails = (spot) => ({
  type: LOAD_SPOT_DETAILS,
  spot,
});

export const setUserSpots = (spots) => ({
  type: SET_USER_SPOTS,
  spots,
});

export const removeSpot = (spotId) => ({
  type: DELETE_SPOT,
  spotId,
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

export const fetchManageSpots = () => async (dispatch) => {
  const response = await fetch("/api/spots/current");

  if (response.ok) {
    const data = await response.json();
    dispatch(setUserSpots(data.Spots));
  } else {
    console.error("Failed to fetch user spots");
  }
};

export const deleteSpot = (spotId) => async (dispatch) => {
  const response = await fetch(`/api/spots/${spotId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    dispatch(removeSpot(spotId));
  } else {
    console.error("Failed to delete spot");
  }
};

export const updateSpotRating = (spotId) => async (dispatch) => {
  const response = await fetch(`/api/spots/${spotId}`);

  if (response.ok) {
      const updatedSpot = await response.json();
      dispatch(loadSpotDetails(updatedSpot)); // ✅ Update Redux state for the spot
  }
};


const initialState = { allSpots: {}, singleSpot: null, userSpots: [] };

export default function spotsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_SPOTS:
      return { ...state, allSpots: action.spots };
    case LOAD_SPOT_DETAILS:
      return { ...state, singleSpot: action.spot };
    case SET_USER_SPOTS:
      return { ...state, userSpots: action.spots };
    case DELETE_SPOT:
      return { 
        ...state,
        allSpots: Object.fromEntries(
          Object.entries(state.allSpots).filter(([id]) => id !== String(action.spotId))
        ),
        userSpots: state.userSpots.filter((spot) => spot.id !== action.spotId),
      };
    default:
      return state;
  }
}
