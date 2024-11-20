export async function fetchFunFact({ lat, lng }) {
  console.log("Inside the Fetch Fun Fact Function");

  // Ensure Google Maps API is loaded
  if (!window.google || !window.google.maps) {
    console.error("Google Maps API not loaded");
    return;
  }

  const latLng = new google.maps.LatLng(lat, lng);
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: latLng }, async (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        const place = results[0].formatted_address;
        console.log("Found place:", place);

        // try {
        //   const response = await fetch("http://localhost:8080/getfunfact", {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ place }),
        //   });

        //   if (!response.ok) {
        //     throw new Error("Network response was not ok");
        //   }

        //   const data = await response.json();
        //   console.log("Fun fact:", data);
        //   resolve(data); // Resolve the promise with the fetched data
        // } catch (error) {
        //   console.error("Error fetching fun fact:", error);
        //   reject(error); // Reject the promise on error
        // }
      } else {
        console.error(
          "Geocode was not successful for the following reason:",
          status
        );
        reject(new Error(status));
      }
    });
  });
}
