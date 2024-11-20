import { fetchFunFact } from "./FetchFacts";

export default function createRoute(origin, waypoints, viewer) {
  console.log("Creating Route with waypoints:", waypoints);
  if (window.google === undefined) {
    console.log("Google Maps API not loaded yet");
    return;
  }
  const directionsService = new google.maps.DirectionsService();
  console.log("Origin of the route:", origin);
  console.log("Waypoints of the route:", waypoints);
  const request = {
    origin,
    destination: origin,
    waypoints,
    travelMode: "DRIVING",
    optimizeWaypoints: true,
  };
  console.log("Request:", request);
  directionsService.route(request, (result, status) => {
    if (status === "OK") {
      const route = result.routes[0];
      console.log("Route:", route);
      const path = [];
      const waypointPositions = waypoints.map((wp) => wp.location);

      route.legs.forEach((leg) => {
        leg.steps.forEach((step) => {
          const decodedPolyline = google.maps.geometry.encoding.decodePath(
            step.polyline.points
          );
          console.log("Decoded Polyline:", decodedPolyline);
          decodedPolyline.forEach((latLng) => {
            if (latLng && latLng.lat && latLng.lng) {
              path.push([latLng.lng(), latLng.lat()]);
            } else {
              console.error("Invalid LatLng detected:", latLng);
            }
          });
        });
      });

      if (path.length > 0) {
        console.log("Constructed path array:", path);
        animateCameraAlongPath(viewer, path, waypointPositions);
        const flattenedPath = path.flat();
        const segments = [];
        let currentSegment = [];
        let currentColor = Cesium.Color.ORANGE.withAlpha(0.8);

        for (let i = 0; i < path.length; i++) {
          const [lng, lat] = path[i];
          currentSegment.push(lng, lat);

          // Check if near a waypoint
          const isNearWaypoint = waypointPositions.some((wp) => {
            const distance = Cesium.Cartesian3.distance(
              Cesium.Cartesian3.fromDegrees(lng, lat),
              Cesium.Cartesian3.fromDegrees(wp.lng(), wp.lat())
            );
            return distance < 50;
          });

          if (isNearWaypoint) {
            if (currentColor !== Cesium.Color.GREEN.withAlpha(0.8)) {
              segments.push({ positions: currentSegment, color: currentColor });
              currentSegment = [lng, lat];
              currentColor = Cesium.Color.GREEN.withAlpha(0.8);
            }
          } else {
            if (currentColor !== Cesium.Color.ORANGE.withAlpha(0.8)) {
              segments.push({ positions: currentSegment, color: currentColor });
              currentSegment = [lng, lat];
              currentColor = Cesium.Color.PURPLE.withAlpha(0.8);
            }
          }
        }
        segments.push({ positions: currentSegment, color: currentColor });

        segments.forEach((segment) => {
          viewer.entities.add({
            polyline: {
              positions: Cesium.Cartesian3.fromDegreesArray(segment.positions),
              width: 10,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.2,
                color: segment.color,
              }),
              clampToGround: true,
            },
          });
        });
      } else {
        console.error("Invalid path length:", path.length);
      }
    } else {
      alert("Directions request failed due to " + status);
    }
  });
}

function animateCameraAlongPath(viewer, path, waypointPositions) {
  if (!path || path.length < 2) {
    console.error("Path must contain at least two points to animate.");
    return;
  }

  let index = 0;

  function calculateHeading(from, to) {
    const fromCartesian = Cesium.Cartesian3.fromDegrees(from[0], from[1]);
    const toCartesian = Cesium.Cartesian3.fromDegrees(to[0], to[1]);
    const direction = Cesium.Cartesian3.subtract(
      toCartesian,
      fromCartesian,
      new Cesium.Cartesian3()
    );
    return Math.atan2(direction.y, direction.x);
  }

  async function moveToNextPoint() {
    if (index >= path.length - 1) {
      console.log("Finished animating along the path.");
      return;
    }

    // Current and next points
    const currentPoint = path[index];
    const nextPoint = path[index + 1];

    const heading = calculateHeading(currentPoint, nextPoint);
    const altitude = 500 + Math.sin(index * 0.1) * 10;

    const nextPosition = Cesium.Cartesian3.fromDegrees(
      nextPoint[0],
      nextPoint[1],
      altitude
    );
    const isNearWaypoint = waypointPositions.some((wp) => {
      const distance = Cesium.Cartesian3.distance(
        Cesium.Cartesian3.fromDegrees(currentPoint[0], currentPoint[1]),
        Cesium.Cartesian3.fromDegrees(wp.lng(), wp.lat())
      );
      return distance < 50;
    });
    const durationChange = isNearWaypoint ? 2.0 : 1.0;
    // Fly camera to the next position
    viewer.camera.flyTo({
      destination: nextPosition,
      duration: durationChange,
      orientation: {
        heading:
          heading +
          (isNearWaypoint
            ? Cesium.Math.toRadians(Math.sin(index * 0.5) * 15)
            : 0),
        pitch: Cesium.Math.toRadians(-65),
        roll: 0.0,
      },
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
      complete: () => {
        index++;
        moveToNextPoint();
      },
    });
  }

  moveToNextPoint();
}
