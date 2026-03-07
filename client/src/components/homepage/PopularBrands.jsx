import "./PopularBrands.css";

const brands = [
  {
    name: "Dhootapapeshwar",
    discount: "UP TO 15% OFF",
    img: "https://via.placeholder.com/120"
  },
  {
    name: "AVP",
    discount: "UP TO 15% OFF",
    img: "https://via.placeholder.com/120"
  },
  {
    name: "Himalaya",
    discount: "UP TO 50% OFF",
    img: "https://via.placeholder.com/120"
  },
  {
    name: "Kottakkal Ayurveda",
    discount: "FLAT 5% OFF",
    img: "https://via.placeholder.com/120"
  },
  {
    name: "Rasayanam",
    discount: "UP TO 70% OFF",
    img: "https://via.placeholder.com/120"
  },
  {
    name: "Zandu",
    discount: "UP TO 50% OFF",
    img: "https://via.placeholder.com/120"
  }
];

const PopularBrands = () => {
  return (
    <div className="brands-section">
      <h2>Popular Brands</h2>

      <div className="brands-row">
        {brands.map((brand, index) => (
          <div className="brand-card" key={index}>
            <div className="brand-img-box">
              <img src={brand.img} alt={brand.name} />
              <div className="brand-discount">
                {brand.discount}
              </div>
            </div>

            <p className="brand-name">{brand.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularBrands;