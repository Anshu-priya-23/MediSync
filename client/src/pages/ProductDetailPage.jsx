import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaArrowLeft, FaCheckCircle, FaTruck } from "react-icons/fa";
import toast from "react-hot-toast";
import inventoryService from "../services/inventoryService";
import { IMAGE_URL } from "../services/api";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./ProductDetail.css";

const ProductDetailPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { addItem } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const urlId = params.id || params.productId;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
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

  const availableStock = useMemo(() => Number(product?.stock || 0), [product]);

  const handleIncrease = () =>
    setQuantity((prev) => {
      const next = prev + 1;
      if (availableStock > 0) {
        return Math.min(next, availableStock, 20);
      }
      return Math.min(next, 20);
    });

  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (!product?._id) {
      toast.error("Product not available");
      return;
    }

    if (availableStock <= 0) {
      toast.error("This medicine is out of stock");
      return;
    }

    setAddingToCart(true);
    try {
      await addItem(product._id, quantity);
      toast.success("Added to cart");
      navigate("/cart");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add item to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px", fontSize: "1.2rem" }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found" style={{ textAlign: "center", padding: "100px" }}>
        <h2>Product not found</h2>
        <p>We couldn't find the product you're looking for.</p>
        <Link to="/" className="back-link">
          <FaArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  const imageSrc =
    String(product.image || "").trim()
      ? `${IMAGE_URL}/uploads/${product.image}`
      : "https://placehold.co/500x500/f3f3f3/35b7a7?text=Image+Coming+Soon";

  return (
    <div className="product-detail-container">
      <div className="detail-header">
        <button onClick={() => window.history.back()} className="back-btn">
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="detail-content">
        <div className="detail-image-section">
          {product.badge && <span className="detail-badge">{product.badge}</span>}
          <img src={imageSrc} alt={product.name} className="detail-image" />
        </div>

        <div className="detail-info-section">
          <span className="detail-brand">{product.brand || "MediSync"}</span>
          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-price-row">
            <span className="detail-price">Rs {Number(product.price || 0).toFixed(2)}</span>
          </div>

          <strong>Description:</strong>
          <p className="detail-description">
            {product.description ||
              `High-quality ${product.name} for your daily healthcare requirements.`}
          </p>

          <div className="detail-trust-points">
            <span>
              <FaCheckCircle color="#35b7a7" /> 100% Genuine
            </span>
            <span>
              <FaTruck color="#35b7a7" /> Fast Pickup
            </span>
          </div>

          <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={handleDecrease} className="qty-btn">
                -
              </button>
              <span className="qty-number">{quantity}</span>
              <button onClick={handleIncrease} className="qty-btn" disabled={availableStock > 0 && quantity >= Math.min(availableStock, 20)}>
                +
              </button>
            </div>

            <button className="add-to-cart-large" onClick={handleAddToCart} disabled={addingToCart || availableStock <= 0}>
              <FaShoppingCart /> {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>

          <div className="extra-info">
            <p>
              <strong>Expiry Date:</strong>{" "}
              {product.expiryDate
                ? new Date(product.expiryDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {product.category || "General"}
            </p>
            <p>
              <strong>Availability:</strong>{" "}
              <span style={{ color: availableStock > 0 ? "green" : "#b42335" }}>
                {availableStock > 0 ? `In Stock (${availableStock})` : "Out of Stock"}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
