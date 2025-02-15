import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { csrfFetch } from "../../../store/csrf";
import { fetchSpotDetails } from "../../../store/spots";
import "./SpotForm.css";

function CreateSpotForm() {
    const {spotId} = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate("");
    const existingSpot = useSelector((state) => state.spots.singleSpot);

    //form state
    const [country, setCountry] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [description, setDescription] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [previewImage, setPreviewImage] = useState("");
    const [image1, setImage1] = useState("");
    const [image2, setImage2] = useState("");
    const [image3, setImage3] = useState("");
    const [image4, setImage4] = useState("");
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (spotId) {
            dispatch(fetchSpotDetails(spotId));
        }
    }, [dispatch, spotId]);

     // ✅ Prefill form when spot details are loaded
     useEffect(() => {
        if (existingSpot && spotId) {
            setCountry(existingSpot.country || "");
            setAddress(existingSpot.address || "");
            setCity(existingSpot.city || "");
            setState(existingSpot.state || "");
            setLatitude(existingSpot.latitude || "");
            setLongitude(existingSpot.longitude || "");
            setDescription(existingSpot.description || "");
            setName(existingSpot.name || "");
            setPrice(existingSpot.price || "");
            setPreviewImage(existingSpot.previewImage || "");
        }
    }, [existingSpot, spotId]);
    
    const text = "Catch guests' attention with a spot title that highlights what makes your place special."
    const text2 = "Where's your place located?"

    const handleSubmit = async (e) => {
        e.preventDefault();

        let validationErrors = {};

    // Required field validations
    if (!address) validationErrors.address = "Street address is required";
    if (!city) validationErrors.city = "City is required";
    if (!state) validationErrors.state = "State is required";
    if (!country) validationErrors.country = "Country is required";
    if (!name) validationErrors.name = "Title is required";
    if (name.length > 50) validationErrors.name = "Title must be less than 50 characters";
    if (!description || description.length < 30)
        validationErrors.description = "Description needs 30 or more characters";
    if (!price || price <= 0) validationErrors.price = "Price per day must be a positive number";
    if (!previewImage && !spotId) {
        validationErrors.previewImage = "Preview Image URL is required";
    }    

    // Latitude & Longitude validation (only if provided)
    if (latitude !== "" && (latitude < -90 || latitude > 90)) 
        validationErrors.latitude = "Latitude must be within -90 and 90";
    if (longitude !== "" && (longitude < -180 || longitude > 180)) 
        validationErrors.longitude = "Longitude must be within -180 and 180";

    // If there are errors, prevent submission
    if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
    }

    const spotData = {
        country,
        address,
        city,
        state,
        latitude: latitude || null,
        longitude: longitude || null,
        description,
        name,
        price,
        images: [previewImage, image1, image2, image3, image4].filter((url) => url),
    };

    try {
        const response = await csrfFetch(spotId ? `/api/spots/${spotId}` : '/api/spots', {
            method: spotId ? "PUT" : "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(spotData),
        });

        if (!response.ok) {
            const data = await response.json();
            setErrors(data.errors || ["Failed to create/update spot."]);
            return;
        }
    
        const createdSpot = await response.json();
            
        // Handle image uploads (NEW spots and UPDATING existing images)
        const imageUrls = [previewImage, image1, image2, image3, image4].filter(url => url);

        await Promise.all(
            imageUrls.map((url, index) =>
                csrfFetch(`/api/spots/${createdSpot.id}/images`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url,
                        previewImage: index === 0, // First image should be the preview
                    }),
                })
            )
        );
    
        // Redirect to the spot's details page after successful update
        navigate(`/spots/${createdSpot.id}`);
    
    } catch (err) {
        setErrors(["Failed to create/update spot."]);
    }
    };

    return (
        <div className="create-spot-container">
            <h1>{spotId ? "Update your Spot" : "Create a New Spot"}</h1>

            <h2 className="undertitle">{text2}</h2>
            <p className="paragraph">Guests will only get your exact address once they booked a reservation.</p>
            <form onSubmit={handleSubmit} className="create-spot-form" noValidate>
                {/* <ul className="errors">
                    {errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                    ))}
                </ul> */}

                <label>
                    Country
                    {errors.country && <p className="error-message">{errors.country}</p>}
                    <input
                        type="text"
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required 
                    />
                </label>

                <label>
                    Street Address
                    {errors.address && <p className="error-message">{errors.address}</p>}
                    <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </label>

                <label>
                    City
                    {errors.city && <p className="error-message">{errors.city}</p>}
                    <input
                        type="text"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                    />
                </label>

                <label>
                    State
                    {errors.state && <p className="error-message">{errors.state}</p>}
                    <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                    />
                </label>

                <div className="lat-long-container">
                    <label>
                        Latitude
                        <input
                            type="number"
                            placeholder="Latitude"
                            step="any"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                        />
                    </label>
                    {errors.latitude && <p className="error-message">{errors.latitude}</p>}

                    <span className="comma">,</span>

                    <label>
                        Longitude
                        <input
                            type="number"
                            placeholder="Longitude"
                            step="any"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                        />
                    </label>
                    {errors.longitude && <p className="error-message">{errors.longitude}</p>}
                </div>    
                

                <div className="section-separator"></div>

                <label>
                    Describe your place to guests
                    <p className="paragraph">Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                    {errors.description && <p className="error-message">{errors.description}</p>}
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Please write at least 30 characters"
                        minLength="30"
                    />
                </label>

                <div className="section-separator"></div>

                <label>
                    Create a title for your Spot
                    <p className="paragraph">{text}</p>
                    {errors.name && <p className="error-message">{errors.name}</p>}
                    <input
                        type="text"
                        placeholder="Name of your spot"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </label>

                <div className="section-separator"></div>

                <label>
                    Set a base price for your Spot
                    <p className="paragraph">Competitive pricing can help your listing stand out and rank higher in search results.</p>
                    {errors.price && <p className="error-message">{errors.price}</p>}
                    <input
                        type="number"
                        placeholder="Price per night (USD)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                        min="1"
                    />
                </label>

                <div className="section-separator"></div>

                <label>
                    Liven up your spot with photos
                    <p className="paragraph">Submit a link to at least one photo to publish your spot.</p>
                    {errors.previewImage && <p className="error-message">{errors.previewImage}</p>}
                    <input
                        type="url"
                        placeholder="Preview Image URL"
                        value={previewImage}
                        onChange={(e) => setPreviewImage(e.target.value)}
                        required={!spotId}
                    />
                </label>

                <label>
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={image1}
                        onChange={(e) => setImage1(e.target.value)}
                    />
                </label>

                <label>
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={image2}
                        onChange={(e) => setImage2(e.target.value)}
                    />
                </label>

                <label>
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={image3}
                        onChange={(e) => setImage3(e.target.value)}
                    />
                </label>

                <label>
                    <input
                        type="text"
                        placeholder="Image URL"
                        value={image4}
                        onChange={(e) => setImage4(e.target.value)}
                    />
                </label>

                <div className="section-separator"></div>

                <button type="submit" className={`create-spot-submit ${spotId ? "update-mode" : ""}`}>
                    {spotId ? "Update your Spot" : "Create Spot"}
                </button>
            </form>
        </div>
    );
}

export default CreateSpotForm;