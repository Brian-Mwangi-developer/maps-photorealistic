import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,

} from "@hello-pangea/dnd";

const DisplayImages = ({ results, selectedCategory, onOrderChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [updatedResults, setUpdatedResults] = useState(results);
  const [originalResults, setOriginalResults] = useState(results);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
    setUpdatedResults(results);
    setOriginalResults(results);
    setIsModified(false);
  }, [results]);

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const getOpeningStatus = (opening_hours) => {
    if (opening_hours && opening_hours.isOpen !== undefined) {
      return opening_hours.isOpen() ? "Open" : "Closed";
    } else {
      return "Unknown";
    }
  };

  // Determine the starting index based on the selected category
  const startIndex =
    selectedCategory === "historical_place" ||
    (Array.isArray(selectedCategory) && selectedCategory.length > 1)
      ? 1
      : 0;

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(updatedResults);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setUpdatedResults(items);
    console.log("updatedResults from Dragging", updatedResults);
    setIsModified(true);
  };
  const handleSave = () => {
    onOrderChange(updatedResults);
    setOriginalResults(updatedResults);
    console.log("updatedResults from Saving", updatedResults);
    setIsModified(false);
  };

  const handleCancel = () => {
    setUpdatedResults(originalResults);
    setIsModified(false);
  };


  return (
    <div>
      <div className="flex justify-between mb-2">
        <button
          onClick={handleSave}
          disabled={!isModified}
          className={`px-4 py-2 font-bold ${
            isModified ? "text-green-600" : "text-gray-400"
          }`}
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          disabled={!isModified}
          className={`px-4 py-2 font-bold ${
            isModified ? "text-red-600" : "text-gray-400"
          }`}
        >
          Cancel
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="images">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="overflow-y-auto flex flex-col gap-4 py-2 max-h-80"
            >
              {updatedResults.length > startIndex && (
                <Draggable
                  key={updatedResults[startIndex].name}
                  draggableId={updatedResults[startIndex].name}
                  index={startIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="flex items-center justify-between bg-white p-4 shadow-md rounded-md"
                    >
                      <div className="flex flex-col">
                        <p className="font-semibold text-gray-800">
                          {updatedResults[startIndex].name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Rating ⭐️: {updatedResults[startIndex].rating}
                        </p>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-md ${
                            getOpeningStatus(
                              updatedResults[startIndex].opening_hours
                            ) === "Open"
                              ? "bg-green-200 text-green-800"
                              : getOpeningStatus(
                                  updatedResults[startIndex].opening_hours
                                ) === "Closed"
                              ? "bg-yellow-200 text-yellow-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {getOpeningStatus(
                            updatedResults[startIndex].opening_hours
                          )}
                        </span>
                      </div>

                      {updatedResults[startIndex].photos &&
                        updatedResults[startIndex].photos[0] && (
                          <img
                            src={updatedResults[startIndex].photos[0].getUrl()}
                            alt={updatedResults[startIndex].name}
                            className="w-24 h-16 object-cover rounded-md ml-4"
                          />
                        )}
                    </div>
                  )}
                </Draggable>
              )}

              {updatedResults
                .slice(
                  startIndex + 1,
                  isExpanded ? updatedResults.length : startIndex + 2
                )
                .map((result, index) => (
                  <Draggable
                    key={result.name}
                    draggableId={result.name}
                    index={index + startIndex + 1}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between bg-white p-4 shadow-md rounded-md"
                      >
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-800">
                            {result.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rating ⭐️: {result.rating}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-md ${
                              getOpeningStatus(result.opening_hours) === "Open"
                                ? "bg-green-200 text-green-800"
                                : getOpeningStatus(result.opening_hours) ===
                                  "Closed"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {getOpeningStatus(result.opening_hours)}
                          </span>
                        </div>

                        {result.photos && result.photos[0] && (
                          <img
                            src={result.photos[0].getUrl()}
                            alt={result.name}
                            className="w-24 h-16 object-cover rounded-md ml-4"
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {updatedResults.length > startIndex + 2 && (
          <div className="text-center mt-2">
            <button
              onClick={toggleExpanded}
              className="text-blue-500 flex items-center gap-1"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {isExpanded ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </DragDropContext>
    </div>
  );
};

export default DisplayImages;
