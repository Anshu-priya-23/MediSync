import "./HeroSection.css";

const HeroSection = () => {
  return (
    <div className="hero-section">
      <h1>Buy Medicines and Essentials</h1>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search Medicines" />
      </div>
    </div>
  );
};

export default HeroSection;