import React from "react";
import InfoBox from "./InfoBox";

const InfoOverlay = ({ name, description, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-0 left-0 w-full flex justify-center p-4">
      <InfoBox text={description} link={null} btnText={name} />
    </div>
  );
};

export default InfoOverlay;
