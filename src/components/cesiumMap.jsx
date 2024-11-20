import React, { useEffect, useRef, useState } from "react";
import searchForType from "../utils/searchCategory";
import FlyCameraToArea from "@/utils/flyCameraToArea";
import startOrbitAroundLocation from "@/utils/OrbitLocation";
import InfoOverlay from "./infoOverlay";
import createRoute from "@/utils/createRoute";

const CesiumMap = ({ onResultsUpdate, selectedCategory, orderedResults }) => {
  const cesiumContainerRef = useRef(null);
  const [viewer, setViewer] = useState(null);
  const [allResults, setAllResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const prevOrderedResultsRef = useRef([]);

  // Initialize Cesium Viewer once
  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAPS_API_KEY;
    if (window.Cesium && window.google && cesiumContainerRef.current) {
      const { Cesium } = window;
      Cesium.RequestScheduler.requestsByServer["tile.googleapis.com:443"] = 18;
      const newViewer = new Cesium.Viewer(cesiumContainerRef.current, {
        imageryProvider: false,
        baseLayerPicker: false,
        homeButton: false,
        fullscreenButton: false,
        navigationHelpButton: false,
        vrButton: false,
        sceneModePicker: false,
        geocoder: false,
        globe: false,
        infobox: false,
        showCesiumLogo: false,
        selectionIndicator: false,
        timeline: false,
        projectionPicker: false,
        clockViewModel: null,
        creditContainer: document.createElement("div"),
        animation: false,
        requestRenderMode: false,
      });
      const tileset = newViewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`,
          showCreditsOnScreen: true,
        })
      );
      setViewer(newViewer);
      initAutocomplete(newViewer);

      newViewer.screenSpaceEventHandler.setInputAction((click) => {
        const pickedObject = newViewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
          const cartesian = newViewer.scene.pickPosition(click.position);
          if (Cesium.defined(cartesian)) {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            const longitude = Cesium.Math.toDegrees(cartographic.longitude);
            const latitude = Cesium.Math.toDegrees(cartographic.latitude);

            console.log("Clicked location:", { longitude, latitude });

            if (window.confirm("Do you want to add a marker here?")) {
              addMarker(newViewer, longitude, latitude);
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      return () => {
        if (newViewer && !newViewer.isDestroyed()) {
          newViewer.destroy();
        }
      };
    } else {
      console.log("No Cesium");
    }
  }, []);

  const addMarker = (viewer,longitude, latitude) => {
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude,300),
      model: {
        uri: "/the_faithful_insignia/scene.gltf",
        minimumPixelSize: 64,
        scale:-1.0,
        maximumScale: 200,
      },
    });
  };
   useEffect(() => {
     if (viewer && orderedResults.length > 0) {
       const prevOrderedResults = prevOrderedResultsRef.current;
       if (
         !areResultsEqual(prevOrderedResults, orderedResults) &&
         orderedResults[0] &&
         orderedResults[0].geometry &&
         orderedResults[0].geometry.location
       ) {
         const location = orderedResults[0].geometry.location;
         FlyCameraToArea(
           orderedResults[0],
           viewer
         );
         createSceneForPlace(viewer, location, orderedResults[0].name);
         setSelectedPlace({
           name: orderedResults[0].name,
           description:
             "This is the Text description of the place as a Dummy and Make sure it displays over the Area",
         });
       }
       else{
        console.log(" i am in here since the Geometry.location does not exist",orderedResults);
       }
       prevOrderedResultsRef.current = orderedResults;
     }
   }, [orderedResults]);

   const areResultsEqual = (prevResults, newResults) => {
     if (prevResults.length !== newResults.length) return false;
     for (let i = 0; i < prevResults.length; i++) {
       if (prevResults[i].name !== newResults[i].name) return false;
     }
     return true;
   };


  
  const initAutocomplete = (viewer) => {
    const input = document.getElementById("pacViewPlace");
    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ["geometry", "name"],
    });

    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );

    autocomplete.addListener("place_changed", async () => {
      const place = autocomplete.getPlace();
      if (!(place.geometry && place.geometry.location)) {
        alert(`Insufficient geometry data for place: ${place.name}`);
        return;
      }

      const location = place.geometry.location;

      await handleSearch(location, viewer);
    });
  };

  
  // const pointCameraAt = (location, elevation, viewer) => {
  //   console.log(" inside the Point Camera At Function");
  //   viewer.camera.flyTo({
  //     destination: Cesium.Cartesian3.fromDegrees(
  //       location.lng() - 3,
  //       location.lat() - 3,
  //       elevation * 2
  //     ),
  //     orientation: {
  //       heading: Cesium.Math.toRadians(45),
  //       pitch: Cesium.Math.toRadians(-45),
  //       roll: 0.0,
  //     },
  //     complete: () => {
  //       console.log("Camera pointed at location", location.lng());
  //       console.log("Camera pointed at location", location.lng() - 3);
  //       startOrbitAroundLocation(location, elevation, viewer);
  //     },
  //   });
  // };

  const createSceneForPlace = (viewer, location, name) => {
    const primitives = viewer.scene.primitives;
    for (let i = 0; i < primitives.length; i++) {
      const primitive = primitives.get(i);
      if (primitive instanceof Cesium.Model) {
        primitives.remove(primitive);
        break; 
      }
    }
    const gltfModel = viewer.scene.primitives.add(
      Cesium.Model.fromGltf({
        url: "/map_pointer/scene.gltf",
        scale: 10.0,
        position: Cesium.Cartesian3.fromDegrees(
          location.lng(),
          location.lat(),
          600
        ),
        minimumPixelSize: 64,
        maximumScale: 200,
      })
    );

    viewer.clock.onTick.addEventListener(() => {
      const currentTime = viewer.clock.currentTime.secondsOfDay;
      const altitudeOffset = Math.sin(currentTime) * 5;
      gltfModel.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
        Cesium.Cartesian3.fromDegrees(
          location.lng(),
          location.lat(),
          300 + altitudeOffset
        )
      );
    });
  };

  // Handle search based on selected category and location
  const handleSearch = async (location, viewer) => {
    const searchTypes = selectedCategory
      ? [selectedCategory]
      : ["museum", "historical_place", "art_gallery", "tourist_attraction"];
    const placesService = new google.maps.places.PlacesService(
      document.createElement("div")
    );
    console.log("Search types:", searchTypes);
    let results = await searchForType(searchTypes, placesService, location);
    const limitedResults = results.slice(0, 25);
    console.log("Limited results before Fly Camera to Area:", limitedResults);

    if (limitedResults.length > 0) {
      const startIndex =
        selectedCategory === "historical_place" ||
        (Array.isArray(selectedCategory) && selectedCategory.length > 1)
          ? 1
          : 0;
      const area = {
        name: limitedResults[startIndex].name,
        geometry: limitedResults[startIndex].geometry,
      };
       const waypoints = limitedResults.map((result) => {
         return {
           location: result.geometry.location,
           stopover: true,
         };
       });


      FlyCameraToArea(area, viewer);
      createRoute(location, waypoints, viewer);
      addBouncingRectangleMarkers(viewer, waypoints);
      createSceneForPlace(viewer, area.geometry.location, area.name);
      setSelectedPlace({
        name: area.name,
        description:
          "This is the Text description of the place as a Dummy and Make sure it displays over the Area",
      });
    }

    setAllResults(limitedResults);
    onResultsUpdate(limitedResults);
  };

  const addBouncingRectangleMarkers = (viewer, waypoints) => {
    waypoints.forEach((waypoint) => {
      const { lat, lng } = waypoint.location;
      const rectangle = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lng(), lat(), 300),
        rectangle: {
          coordinates: Cesium.Rectangle.fromDegrees(
            lng() - 0.0001,
            lat() - 0.0001,
            lng() + 0.0001,
            lat() + 0.0001
          ),
          material: Cesium.Color.GREEN.withAlpha(0.5),
        },
      });

      viewer.clock.onTick.addEventListener(() => {
        const currentTime = viewer.clock.currentTime.secondsOfDay;
        const altitudeOffset = Math.sin(currentTime) * 10; 
        rectangle.position = Cesium.Cartesian3.fromDegrees(
          lng(),
          lat(),
          300 + altitudeOffset
        );
      });
    });
  };
  useEffect(() => {
    if (viewer && allResults.length > 0) {
      const startIndex =
        selectedCategory === "historical_place" ||
        (Array.isArray(selectedCategory) && selectedCategory.length > 1)
          ? 1
          : 0;
      const location = allResults[startIndex].geometry.location;
      console.log("Fly to first result:", allResults[1]);
      handleSearch(location, viewer);

      console.log(
        "Fly to first result again :",
        allResults[1].geometry.location
      );
      FlyCameraToArea(
        {
          lat: allResults[1].geometry.location.lat(),
          lng: allResults[1].geometry.location.lng(),
        },
        viewer
      );
      createRoute(location, allResults, viewer);
      createSceneForPlace(viewer, location, allResults[1].name);
    }
  }, [selectedCategory]);

  

  return (
    <div
      ref={cesiumContainerRef}
      id="cesiumContainer"
      style={{ width: "100%"}}
    >
      {selectedPlace && selectedCategory && (
        <InfoOverlay
          name={selectedPlace.name}
          description={selectedPlace.description}
          isVisible={Boolean(selectedCategory)}
        />
      )}
    </div>
  );
};

export default CesiumMap;
