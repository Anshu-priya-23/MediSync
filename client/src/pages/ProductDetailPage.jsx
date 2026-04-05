import React, { useState, useEffect } from "react"; // Added useEffect
import { useParams, Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaArrowLeft,
  FaCheckCircle,
  FaTruck,
} from "react-icons/fa";
import inventoryService from "../services/inventoryService"; // Import your service
import "./ProductDetail.css";
import { API_URL, IMAGE_URL } from "../services/api";

const ProductDetailPage = () => {
  const params = useParams();
  const urlId = params.id || params.productId;

  // --- State Management ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // --- Fetch Dynamic Product Data ---
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        // Assuming you add a getProductById method to your inventoryService
        const data = await inventoryService.getProductById(urlId);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (urlId) {
      fetchProductDetails();
    }
  }, [urlId]);

  const handleIncrease = () => setQuantity((prev) => prev + 1);
  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // --- Loading State ---
  if (loading) {
    return (
      <div
        style={{ textAlign: "center", padding: "100px", fontSize: "1.2rem" }}
      >
        Loading product details...
      </div>
    );
  }

  // --- Error / Not Found State ---
  if (!product) {
    return (
      <div
        className="product-not-found"
        style={{ textAlign: "center", padding: "100px" }}
      >
        <h2>Product not found</h2>
        <p>We couldn't find the product you're looking for.</p>
        <Link to="/" className="back-link">
          <FaArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <div className="detail-header">
        <button onClick={() => window.history.back()} className="back-btn">
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="detail-content">
        {/* Image Section */}
        <div className="detail-image-section">
          {product.badge && (
            <span className="detail-badge">{product.badge}</span>
          )}
          <img
            src={`${IMAGE_URL}/uploads/${product.image}`}
            alt={product.name}
            className="detail-image"
          />
        </div>

        {/* Information Section */}
        <div className="detail-info-section">
          <span className="detail-brand">{product.brand}</span>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-price-row">
            <span className="detail-price">₹{product.price}</span>
            {/* {product.oldPrice && (
              <span className="detail-old-price">₹{product.oldPrice}</span>
            )}
            {product.discount && (
              <span className="detail-discount-tag">{product.discount}</span>
            )} */}
          </div>

          <strong>Description:</strong>
          <p className="detail-description">
            {product.description ||
              `High-quality ${product.name} designed by ${product.brand}. This product is highly rated in the ${product.category} category.`}
          </p>

          <div className="detail-trust-points">
            <span>
              <FaCheckCircle color="#35b7a7" /> 100% Genuine
            </span>
            <span>
              <FaTruck color="#35b7a7" /> Fast Delivery
            </span>
          </div>

          <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={handleDecrease} className="qty-btn">
                -
              </button>
              <span className="qty-number">{quantity}</span>
              <button onClick={handleIncrease} className="qty-btn">
                +
              </button>
            </div>

            <button className="add-to-cart-large">
              <FaShoppingCart /> Add to Cart
            </button>
          </div>

          <div className="extra-info">
            <p>
              <strong>Expiry Date:</strong>{" "}
              {new Date(product.expiryDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            <p>
              <strong>Availability:</strong>{" "}
              <span style={{ color: "green" }}>In Stock</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
