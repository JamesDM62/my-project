const LOAD_SPOTS = "spots/LOAD_SPOTS";

export const loadSpots = (spots) => ({
  type: LOAD_SPOTS,
  spots,
});

export const fetchSpots = () => async (dispatch) => {
  const response = await fetch("/api/spots"); // Ensure this endpoint exists in your backend
  if (response.ok) {
    const data = await response.json();
    dispatch(loadSpots(data.Spots));
  }
};

const initialState = { allSpots: {} };

export default function spotsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_SPOTS:
      return { ...state, allSpots: action.spots };
    default:
      return state;
  }
}
