import "./PopularProducts.css";
import { useRef } from "react";
import { FaChevronRight } from "react-icons/fa";

const products = [
  {
    name: "Cetaphil Gentle Cleanser 118 ml",
    price: 358,
    oldPrice: 459,
    discount: "22% OFF",
    img: "https://via.placeholder.com/200"
  },
  {
    name: "Scalpe Plus Anti Dandruff Shampoo",
    price: 261,
    oldPrice: 330,
    discount: "21% OFF",
    img: "https://via.placeholder.com/200"
  },
  {
    name: "AHAGLOW Advanced Face Wash",
    price: 630,
    oldPrice: 798,
    discount: "21% OFF",
    img: "https://via.placeholder.com/200"
  },
  {
    name: "Triclenz Hair Cleanser 250 ml",
    price: 444,
    oldPrice: 529,
    discount: "16% OFF",
    img: "https://via.placeholder.com/200"
  }
];

const PopularProducts = () => {
  const rowRef = useRef();

  const scrollRight = () => {
    rowRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="popular-section">
      <div className="section-header">
        <h2>Popular Products</h2>
        <span className="view-all">View All</span>
      </div>

      <div className="product-wrapper">
        <div className="product-row" ref={rowRef}>
          {products.map((item, index) => (
            <div className="product-card" key={index}>
              <img src={item.img} alt={item.name} />

              <p className="product-name">{item.name}</p>

              <div className="price-section">
                <span className="price">₹{item.price}</span>
                <span className="old-price">₹{item.oldPrice}</span>
              </div>

              <p className="discount">{item.discount}</p>

              <button className="add-btn">
                Add <span>+</span>
              </button>
            </div>
          ))}
        </div>

        <button className="scroll-btn" onClick={scrollRight}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default PopularProducts;