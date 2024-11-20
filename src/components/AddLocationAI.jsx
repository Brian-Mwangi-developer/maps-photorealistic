import React, { useEffect, useState } from "react";
import ProcessWithGeminiAI from "@/utils/gemini";

const AIAgent = ({ transcription, onResultsUpdate }) => {
  console.log("Inside the AI Agent Component", transcription);
  const [placesService, setPlacesService] = useState(null);

  useEffect(() => {
    if (window.google) {
      const service = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      setPlacesService(service);
    } else {
      console.log("Google Maps API not loaded yet");
    }
  }, []);

  useEffect(() => {
    const processTranscription = async () => {
      if (transcription && placesService) {
        try {
          const { action, location, position } = await ProcessWithGeminiAI(
            transcription
          );

          console.log("Action:", action);
          console.log("Location:", location);
          console.log("Position:", position);

          if (action === "add" && location) {
            searchAndAddLocation(location, position);
          }
        } catch (error) {
          console.error("Error processing transcription:", error);
        }
      } else {
        console.log("Transcription or PlacesService not available yet");
      }
    };

    processTranscription();
  }, [transcription, placesService]);

  const searchAndAddLocation = (location, position) => {
    const request = {
      query: location,
      fields: ["name", "geometry"],
    };

    placesService.findPlaceFromQuery(request, (results, status) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results.length > 0
      ) {
        const place = results[0];
        console.log("Place found:", place);
        onResultsUpdate((prevResults) => {
          const newResults = [...prevResults];
          if (position !== undefined && position < newResults.length) {
            newResults.splice(position, 0, place);
          } else {
            newResults.push(place);
          }
          return newResults;
        });
      }
    });
  };

  return null;
};

export default AIAgent;
