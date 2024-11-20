export default async function searchForType(type,placesService,location) {
  console.log("Searching for type in the function:", type);
  return new Promise((resolve) => {
    const request = {
      location,
      radius: 5000,
      type: type,
    };
    placesService.nearbySearch(request, (results, status) => {
      console.log("in the Nearby Search",request.location)
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results.length
      ) {
        resolve(results);
      } else {
        console.warn(`No results found for type: ${type}`);
        resolve([]);
      }
    });
  });
}
