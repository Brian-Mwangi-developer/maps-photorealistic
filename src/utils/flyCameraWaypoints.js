export default async function flyCameraAlongWaypoints(waypoints, viewer) {
  console.log("waypoints", waypoints);
  let index = 0;
  console.log("Inside the flyCameraAlongWaypoints function");
  function moveToNextWaypoint() {
    if (index < waypoints.length) {
      const { location } = waypoints[index];
      const lat = location.lat(); // Call the function to get the value
      const lng = location.lng(); // Call the function to get the value

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lng, lat, 100),
          orientation:{
            heading: Cesium.Math.toRadians(300),
          },
        duration: 5, // Adjust duration for smoother transitions
        complete: () => {
          document.querySelector(
            "#labelOverlay"
          ).innerText = `Visiting: Waypoint ${index + 1}`;
          document.querySelector("#labelOverlay").style.display = "block";

          index++;
          setTimeout(() => {
            document.querySelector("#labelOverlay").style.display = "none";
            moveToNextWaypoint();
          }, 2000); // Adjust time to display the label if needed
        },
      });
    }
  }

  moveToNextWaypoint();
}
