import { csrfFetch } from "./csrf";
import { updateSpotRating } from "./spots";

const SET_REVIEWS = "reviews/SET_REVIEWS";
const SET_USER_REVIEWS = "reviews/SET_USER_REVIEWS";
const ADD_REVIEW = "reviews/ADD_REVIEW";
const REMOVE_REVIEW = "reviews/REMOVE_REVIEW";
const UPDATE_REVIEW = "reviews/SET_USER_REVIEWS";

const setReviews = (spotId, reviews) => ({
    type: SET_REVIEWS,
    spotId, 
    reviews,
});

const setUserReviews = (reviews) => ({
    type: SET_USER_REVIEWS,
    reviews,
});

const addReview = (spotId, review) => ({
    type: ADD_REVIEW,
    spotId,
    review,
});

const updateReviewState = (spotId, updatedReview) => ({
    type: UPDATE_REVIEW,
    spotId,
    updatedReview,
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

export const createReview = (spotId, reviewData) => async (dispatch, getState) => {
    if (!spotId) {
        return { errors: { spotId: "Spot ID is required" } };
    }

    const response = await csrfFetch(`/api/spots/${spotId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
    });

    if (response.ok) {
        const newReview = await response.json();
        const currentUser = getState().session.user;

        const reviewWithUser = {
            ...newReview,
            User: { firstName: currentUser.firstName },
        };
        
        dispatch(addReview(spotId, reviewWithUser));
        await dispatch(updateSpotRating(spotId));
        
        return reviewWithUser;
    } else {
        const errors = await response.json();
        return errors;
    }
};

export const deleteReview = (reviewId, spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
        dispatch(removeReview(reviewId));
        dispatch(fetchSpotReviews(spotId));
        dispatch(updateSpotRating(spotId));
    }
};

export const updateReview = (reviewId, reviewData) => async (dispatch, getState) => {
    const response = await csrfFetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
    });

    if (response.ok) {
        const updatedReview = await response.json();


       const reviewsState = getState().reviews;
        let spotIdToUse = null;
        for (const spotId in reviewsState) {
            if (reviewsState[spotId].some((r) => r.id === updatedReview.id)) {
                spotIdToUse = spotId;
                break;
            }
        }

        dispatch(updateReviewState(spotIdToUse, updatedReview));

        return updatedReview;
    } else {
        const errors = await response.json();
        return errors;
    }
};


export const fetchUserReviews = () => async (dispatch) => {
    const response = await csrfFetch("/api/reviews/current");

    if (response.ok) {
        const data = await response.json();
        dispatch(setUserReviews(data.Reviews));
    }
};

const initialState = {};

export default function reviewsReducer(state = initialState, action) {
    switch (action.type) {
        case SET_REVIEWS: {
            return { ...state, [action.spotId]: action.reviews };
        }
        case SET_USER_REVIEWS: {
            return { ...state, userReviews: action.reviews };
        }
        case ADD_REVIEW: {
            const newState = { 
                ...state, 
                [action.spotId]: [action.review, ...(state[action.spotId] || [])] 
            };
            return newState;
        }
        case REMOVE_REVIEW: {
            const newState = { ...state };
            for (const spotId in newState) {
                newState[spotId] = newState[spotId].filter((r) => r.id !== action.reviewId);
            }
            return newState;
        }
        case UPDATE_REVIEW:
            return { 
                ...state, 
                [action.spotId]: state[action.spotId].map((review) =>
                    review.id === action.updatedReview.id ? action.updatedReview : review
                ), 
            };
        default:
            return state;
    }
}