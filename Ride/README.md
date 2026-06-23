Google Maps setup

This page uses the Google Maps JavaScript API (Places) for pickup/destination autocomplete and map markers.

1. Get an API key
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Create an API key and enable the following APIs: "Maps JavaScript API" and "Places API".

2. Add your API key
   - Open `Ride/html/find_ride.html` and replace `YOUR_API_KEY` in the script URL with your API key.
   - Example:
      <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_REAL_KEY&libraries=places,marker&callback=initMap" async defer></script>

3. Test locally
   - Serve the project with a local static server (recommended) to avoid CORS/file:// restrictions.
   - Example using Python 3 in the project root:

```bash
python -m http.server 8000
# then open http://localhost:8000/Ride/html/find_ride.html
```

4. Notes
   - The map centers on the user's current geolocation if permitted; fallback is Metro Manila.
   - The `Search Rides` and `Post Ride Offer` functions now log coordinates (if available) and include markers when Places returns geometry.
   - No backend is included — integrate your server to use the coordinates for matching/offers.
    - Migration notes: the code attempts to use `google.maps.marker.AdvancedMarkerElement` and `google.maps.places.PlaceAutocompleteElement` when available (recommended). If your API version doesn't expose these, the script falls back to the legacy `google.maps.Marker` and `google.maps.places.Autocomplete`.
    - Common error: `InvalidKeyMapError` / `InvalidKey` — ensure the API key is valid, billing is enabled on the project, and that the key's referrer restrictions (HTTP referrers) include `http://localhost` (or your dev host). See: https://developers.google.com/maps/documentation/javascript/error-messages#invalid-key-map-error
