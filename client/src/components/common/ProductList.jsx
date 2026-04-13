import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";
import { FaShoppingCart } from "react-icons/fa";
import { API_URL, IMAGE_URL } from "../../services/api";

const ProductList = ({ categoryTitle, products }) => {
    // Initialize the navigate hook
    const navigate = useNavigate();

    // If no products are passed or the array is empty, show a fallback message
    if (!products || products.length === 0) {
        return (
            <div className="product-section">
                <h2 className="section-title">{categoryTitle}</h2>
                <p className="no-products">No products available in this category yet.</p>
            </div>
        );
    }

    // This handles clicking the "Add to Cart" button
    const viewMedicine = (e, product) => {
        e.stopPropagation();
        // Navigate to the product page when they click Add
        navigate(`/product/${product._id}`);
    };

    return (
        <div className="product-section">
            <h2 className="section-title">{categoryTitle}</h2>

            <div className="product-grid">
                {products.map((product) => (

                    <div
                        className="product-card"
                        key={product.id}
                        onClick={() => navigate(`/product/${product._id}`)}
                        style={{ cursor: "pointer" }}
                    >
                        {/* We put the onClick on the main wrapper div above */}

                        <div className="product-image-container">
                            <img
                                src={`${IMAGE_URL}/uploads/${product.image}` || "https://placehold.co/300x250/f3f3f3/35b7a7?text=Image+Coming+Soon"}
                                alt={product.name}
                                className="product-image"
                            />
                            {product.badge && <span className="product-badge">{product.badge}</span>}
                        </div>

                        {/* Product Details */}
                        <div className="product-info">
                            <span className="product-brand">{product.brand}</span>
                            <h4 className="product-name">{product.name}</h4>

                            <div className="product-bottom-row">
                                <span className="product-price">Rs {product.price.toFixed(2)}</span>

                                {/* We handle the button click separately with stopPropagation */}
                                <button
                                    className="add-to-cart-btn"
                                    onClick={(e) => viewMedicine(e, product)}
                                >
                                    View <span>→</span>
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;