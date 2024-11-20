function startOrbitAroundLocation(area, elevation, viewer) {
  console.log("The Start Orbit function is running");
  if (area.geometry && area.geometry.location) {
    const location = area.geometry.location;
    const center = Cesium.Cartesian3.fromDegrees(
      location.lng(),
      location.lat(),
      elevation
    );

    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    viewer.scene.camera.lookAtTransform(
      transform,
      new Cesium.HeadingPitchRange(0, -Math.PI / 4, 500)
    );
  } else {
    const location = area;
    const center = Cesium.Cartesian3.fromDegrees(
      location.lng,
      location.lat,
      elevation
    );
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    viewer.scene.camera.lookAtTransform(
      transform,
      new Cesium.HeadingPitchRange(0, -Math.PI / 4, 500)
    );
  }

  // Orbit this point
  viewer.clock.onTick.addEventListener(function (clock) {
    viewer.scene.camera.rotateRight(0.009);
  });
}

export default startOrbitAroundLocation;
