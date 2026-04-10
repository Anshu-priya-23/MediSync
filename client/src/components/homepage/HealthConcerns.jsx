import React from "react";
import { Link } from "react-router-dom"; // 1. Import Link
import "./HealthConcerns.css";

import diabetes from "../../assets/health/diabetes.jpg";
import heart from "../../assets/health/heart.png";
import stomach from "../../assets/health/stomach.png";
import liver from "../../assets/health/liver.png";
import bone from "../../assets/health/bone.png";
import kidney from "../../assets/health/kidney.png";
import derma from "../../assets/health/derma.png";
import respiratory from "../../assets/health/respiratory.png";

const concerns = [
  { name: "Diabetes", img: diabetes },
  { name: "Heart Care", img: heart },
  { name: "Stomach Care", img: stomach },
  { name: "Liver Care", img: liver },
  { name: "Bone, Joint & Muscle Care", img: bone },
  { name: "Kidney Care", img: kidney },
  { name: "Derma Care", img: derma },
  { name: "Respiratory Care", img: respiratory },
];

const HealthConcerns = () => {
  // 2. Helper function to create URL paths (e.g., "Heart Care" -> "heart-care")
  const createSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace spaces and special characters with hyphens
      .replace(/(^-|-$)+/g, '');   // Remove trailing/leading hyphens
  };

  return (
    <div className="health-section">
      <h2>Shop by health concerns</h2>

      <div className="concern-row">
        {concerns.map((item, index) => (
          // 3. Replace the <div> with a <Link> component
          <Link
            to={`/category/${createSlug(item.name)}`}
            className="concern-card"
            key={index}
            style={{ textDecoration: 'none', color: 'inherit' }} // Prevents link underlines
          >
            <img src={item.img} alt={item.name} />
            <p>{item.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HealthConcerns;