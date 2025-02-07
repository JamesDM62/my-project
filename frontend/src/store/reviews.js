const SET_REVIEWS = "reviews/SET_REVIEWS";
const REMOVE_REVIEW = "reviews/REMOVE_REVIEW";

const setReviews = (spotId, reviews) => ({
    type: SET_REVIEWS,
    spotId, 
    reviews,
});

const removeReview = (reviewId) => ({
    type: REMOVE_REVIEW,
    reviewId,
});

export const fetchSpotReviews = (spotId) => async (dispatch) => {
    const response = await fetch(`/api/spots/${spotId}/reviews`);
    if (response.ok) {
        const data = await response.json();
        dispatch(setReviews(spotId, data.Reviews));
    }
};

export const deleteReview = (reviewId) => async (dispatch) => {
    const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
    });

    if (response.ok) {
        dispatch(removeReview(reviewId));
    }
};

const initialState = {};

export default function reviewsReducer(state = initialState, action) {
    switch (action.type) {
        case SET_REVIEWS: {
            return { ...state, [action.spotId]: action.reviews };
        }
        case REMOVE_REVIEW: {
            const newState = { ...state };
            for (const spotId in newState) {
                newState[spotId] = newState[spotId].filter((r) => r.id !== action.reviewId);
            }
            return newState;
        }
        default:
            return state;
    }
}