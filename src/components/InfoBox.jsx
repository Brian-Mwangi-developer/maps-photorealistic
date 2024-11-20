import React from "react";
import { Link } from "react-router-dom";

const InfoBox = ({ text, link, btnText }) => (
  <div className="info-box">
    <p className=" font-medium sm:text-xl text-center">{text}</p>
    <Link to="/about" className="neo-brutalism-white neo-btn">
      {btnText}
      <img src="./arrow.svg" alt="arrow" className="w-4 h-4 object-contain" />
    </Link>
  </div>
);

export default InfoBox;
