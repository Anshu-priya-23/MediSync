import "./PopularProducts.css";
import React, { useRef, useState, useEffect } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import inventoryService from "../../services/inventoryService";
import { API_URL, IMAGE_URL } from "../../services/api";

const PopularProducts = () => {
  const rowRef = useRef();
  const navigate = useNavigate();

  // State for dynamic products and loading status
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products from API on mount
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getAllMedicines();
        // Slicing the first 12 items to show as "Popular"
        setPopularItems(data.slice(0, 12));
      } catch (error) {
        console.error("Failed to load popular products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, []);

  const scrollRight = () => {
    rowRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const scrollLeft = () => {
    rowRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const viewMedicine = (e, item) => {
    e.stopPropagation();
    // Logic for cart can go here
    console.log("Added to cart:", item.name);
    // Navigating using the database ID (usually _id from MongoDB)
    navigate(`/product/${item._id || item.id}`);
  };

  if (loading) {
    return <div className="popular-section" style={{ textAlign: 'center', padding: '20px' }}>Loading popular products...</div>;
  }

  return (
    <div className="popular-section">
      <div className="section-header">
        <h2>Popular Products</h2>
      </div>

      <div className="product-wrapper" style={{ position: "relative", display: "flex", alignItems: "center" }}>

        <button
          className="scroll-btn"
          onClick={scrollLeft}
          style={{ position: "absolute", left: "-20px", zIndex: 10 }}
        >
          <FaChevronLeft />
        </button>

        <div className="product-row" ref={rowRef}>
          {popularItems.map((item) => (
            <div
              className="product-card"
              key={item._id || item.id}
              onClick={() => navigate(`/product/${item._id || item.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ position: "relative" }}>
                <img src={`${IMAGE_URL}/uploads/${item.image}`} alt={item.name} style={{ width: "100%", borderRadius: "8px" }} />
                {item.badge && (
                  <span
                    className="product-badge"
                    style={{ position: "absolute", top: 10, left: 10, background: "#35b7a7", color: "white", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <p className="product-name">{item.name}</p>

              <div className="price-section">
                <span className="price">₹{item.price}</span>
                {item.oldPrice && (
                  <span className="old-price" style={{ textDecoration: "line-through", color: "#888", fontSize: "14px", marginLeft: "8px" }}>
                    ₹{item.oldPrice}
                  </span>
                )}
              </div>

              {item.discount && (
                <p className="discount" style={{ color: "#35b7a7", fontSize: "13px", fontWeight: "bold", margin: "4px 0" }}>
                  {item.discount}
                </p>
              )}

              <button
                className="add-btn"
                onClick={(e) => viewMedicine(e, item)}
              >
                View <span>→</span>
              </button>
            </div>
          ))}
        </div>

        <button
          className="scroll-btn"
          onClick={scrollRight}
          style={{ position: "absolute", right: "-20px", zIndex: 10 }}
        >
          <FaChevronRight />
        </button>

      </div>
    </div>
  );
};

export default PopularProducts;