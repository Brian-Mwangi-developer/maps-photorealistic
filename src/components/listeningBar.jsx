import React from "react";

const ListeningBars = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white opacity-50"></div>

      {/* Popup Content */}
      <div className="relative z-20 p-6  rounded-lg  text-black">
        <h2 className="text-md font-bold mb-4">Start by saying</h2>
        <span>"Hi Tourista"</span>
        <div className="h-20 w-20 bg-blue-600 rounded-full flex justify-center items-center animate-pulse">
          <svg
            width="3em"
            height="3em"
            viewBox="0 0 16 16"
            className="bi bi-play-fill"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ListeningBars;
