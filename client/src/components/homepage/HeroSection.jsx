import "./HeroSection.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const [allMedicines, setAllMedicines] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const navigate = useNavigate();

  // ✅ Fetch all medicines once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5002/api/medicines");
        setAllMedicines(res.data || []);
      } catch (err) {
        console.log("Error fetching medicines:", err);
      }
    };

    fetchData();
  }, []);

  // ✅ Filter on typing
  useEffect(() => {
    if (!query.trim()) {
      setFiltered([]);
      return;
    }

    const lowerQuery = query.toLowerCase();

    const result = allMedicines.filter((med) =>
      med.name?.toLowerCase().includes(lowerQuery)
    );

    setFiltered(result);
  }, [query, allMedicines]);

  // ✅ Handle click (navigation)
  const handleSelect = (id) => {
    setQuery("");
    setFiltered([]);
    setShowResults(false);
    navigate(`/product/${id}`);
  };

  return (
    <div className="hero-section">
      <h1>Buy Medicines and Essentials</h1>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search Medicines"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 300)} // ✅ FIXED
        />
      </div>

      {/* ✅ Results Dropdown */}
      {showResults && query && (
        <div className="search-results">
          {filtered.length > 0 ? (
            filtered.slice(0, 5).map((item) => (
              <div
                key={item._id}
                className="result-item"
                onMouseDown={() => handleSelect(item._id)} // ✅ FIXED
              >
                <div>
                  <strong>{item.name}</strong>
                </div>

                <div style={{ fontSize: "12px", color: "gray" }}>
                  {item.category || "General"}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No medicines found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroSection;