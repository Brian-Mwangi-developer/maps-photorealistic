import React, { useState, useEffect, useRef } from "react";
import CesiumMap from "@/components/cesiumMap";
import { Search } from "lucide-react";
import DisplayImages from "@/components/ImageSection";
import VoiceWidget from "@/components/VoiceWidget";
import ListeningBars from "@/components/listeningBar";

function Home() {
  const [results, setResults] = useState([]);
  const [orderedResults, setOrderedResults] = useState([]);
  const [wakeup, setWakeup] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleDoubleClick = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div
      className={`relative flex flex-col items-center ${
        isFullScreen
          ? "h-screen bg-black"
          : "min-h-screen bg-gradient-to-b from-blue-50 to-blue-100"
      }`}
      onDoubleClick={handleDoubleClick}
    >
      {!isFullScreen && (
        <>
          {/* Search Bar */}
          <div className="flex flex-row top-0 w-full px-4 py-3 bg-white shadow-md">
            <div className="flex items-center p-2 mb-0 rounded-lg bg-blue-50 w-full">
              <Search className="text-blue-600" />
              <input
                type="text"
                id="pacViewPlace"
                name="pacViewPlace"
                placeholder="Search for a place..."
                className="flex-grow w-3/4 ml-8 p-2 text-gray-700 bg-transparent outline-none placeholder-gray-400"
              />
            </div>
            <button
              onClick={toggleFullScreen}
              className="p-2 bg-white rounded-full shadow-md flex items-center justify-center absolute right-2 cursor-pointer"
            >
              🎞️
            </button>
          </div>
          {/* Category Icons */}
          <div className="flex justify-around w-full py-3  bg-white shadow-sm">
            <button
              className="flex flex-col items-center text-blue-600"
              onClick={() => handleCategoryClick("museum")}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center p-2">
                <span className="text-xl">🏛️</span>
              </div>
              <p className="text-xs mt-1">Museums</p>
            </button>
            <button
              className="flex flex-col items-center text-blue-600"
              onClick={() => handleCategoryClick("historical_place")}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center p-2">
                <span className="text-xl">🏰</span>
              </div>
              <p className="text-xs mt-1">Landmarks</p>
            </button>
            <button
              className="flex flex-col items-center text-blue-600"
              onClick={() => handleCategoryClick("park")}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center p-2">
                <span className="text-xl">🌲</span>
              </div>
              <p className="text-xs mt-1">Parks</p>
            </button>
          </div>
        </>
      )}

      {/* Map */}
      <div
        className={`flex-grow w-full ${
          isFullScreen ? "h-full" : "max-h-[60vh]"
        }`}
      >
        <CesiumMap
          selectedCategory={selectedCategory}
          orderedResults={orderedResults}
          onResultsUpdate={(newResults) => {
            console.log("Received new results:", newResults);
            setResults(newResults);
          }}
        />
      </div>

      {isFullScreen && (
        <button
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-lg text-black"
          onClick={() => setIsFullScreen(false)}
        >
          <span className="text-2xl">X</span>
        </button>
      )}
      <div id="labelOverlay"></div>
      {wakeup && <ListeningBars />}

      {!isFullScreen && (
        <div className="fixed bottom-0 w-full p-4 bg-white border-t border-gray-200 mt-0 shadow-lg h-25">
          <div className="relative">
            <div className="absolute flex justify-end right-0 transform -top-8 z-10">
              <VoiceWidget listening={setWakeup} onResultsUpdate={setResults} />
            </div>
            <DisplayImages
              results={results}
              selectedCategory={selectedCategory}
              onOrderChange={setOrderedResults}
            />
          </div>
        </div>
      )}

      {isFullScreen && (
        <div className="fixed bottom-16 right-20 z-20">
          <VoiceWidget listening={setWakeup} onResultsUpdate={setResults} />
        </div>
      )}
    </div>
  );
}

export default Home;
