import startOrbitAroundLocation from "./OrbitLocation";

export default async function FlyCameraToArea(area, viewer) {
  console.log("area", area);
  console.log("the viewer is ", viewer.scene);

  let destination;

  if (area.geometry && area.geometry.location) {
    const location = area.geometry.location;
    console.log("location longitude", location.lng());
    destination = Cesium.Cartesian3.fromDegrees(
      location.lng() - 0.004,
      location.lat() - 0.004,
      500 +100
    );
  } else {
    console.log("Inside the Fly Camera Else Function");
    console.log("I am already Flying dont tamper with me");
    destination = Cesium.Cartesian3.fromDegrees(area.lng, area.lat, 600);
  }
  console.log("the location is", area)
  viewer.camera.flyTo({
    destination: destination,
    orientation: {
      heading: Cesium.Math.toRadians(45),
      pitch: Cesium.Math.toRadians(-50),
      roll: 0.0,
    },
    duration: 5,
    complete: () => {
      startOrbitAroundLocation(area, 200, viewer);
     
      document.querySelector("#labelOverlay").innerText = area.name;
      document.querySelector("#labelOverlay").style.display = "block";
      setTimeout(() => {
        document.querySelector("#labelOverlay").style.display = "none";
      }, 2000);
    },
  });
}
