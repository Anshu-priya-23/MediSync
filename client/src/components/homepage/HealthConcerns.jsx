import "./HealthConcerns.css";

import diabetes from "../../assets/health/diabetes.jpg";  // jpg
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
  return (
    <div className="health-section">
      <h2>Shop by health concerns</h2>

      <div className="concern-row">
        {concerns.map((item, index) => (
          <div className="concern-card" key={index}>
            <img src={item.img} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthConcerns;