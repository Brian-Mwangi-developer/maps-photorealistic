// function MoveAroundTheCity(area, elevation, viewer) {
//   console.log("The Start Orbit function is running");

//   let location;

//   // Check if the location is a function (like a callback function or a getter)
//   if (typeof area.geometry?.location === "function") {
//     location = area.geometry.location();
//   } else if (area.geometry?.location) {
//     location = area.geometry.location;
//   } else {
//     console.error("Location is neither a function nor directly accessible.");
//     return;
//   }

//   if (
//     typeof location.lng !== "function" ||
//     typeof location.lat !== "function"
//   ) {
//     console.error("Invalid location format.");
//     return;
//   }

//   const center = Cesium.Cartesian3.fromDegrees(
//     location.lng(),
//     location.lat(),
//     elevation
//   );

//   // Define the orbiting radius
//   const radius = 5000; // 5000 meters

//   // Function to move the camera in a circular orbit
//   let angle = 0;
//   viewer.clock.onTick.addEventListener(function () {
//     angle += 0.01; // Increment the angle for the circular movement
//     const xOffset = radius * Math.cos(angle);
//     const yOffset = radius * Math.sin(angle);

//     const orbitPosition = Cesium.Cartesian3.fromDegrees(
//       location.lng() + xOffset / 100000, // Adjusting to degrees (longitude/latitude scale)
//       location.lat() + yOffset / 100000,
//       elevation
//     );

//     const transform = Cesium.Transforms.eastNorthUpToFixedFrame(orbitPosition);
//     viewer.scene.camera.lookAtTransform(
//       transform,
//       new Cesium.HeadingPitchRange(0, -Math.PI / 4, 500)
//     );
//   });
// }

// export default MoveAroundTheCity;
