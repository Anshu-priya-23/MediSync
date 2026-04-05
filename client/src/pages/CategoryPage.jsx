import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProductList from "../components/common/ProductList";
import inventoryService from "../services/inventoryService";

const CategoryPage = () => {
    const { categoryName } = useParams();
    const [dynamicProducts, setDynamicProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const categoryMap = {
        "baby-care": "Baby Care",
        "medicine": "Medicine",
        "beauty": "Beauty",
        "wellness": "Wellness",
        "health-devices": "Health Devices",
        "diabetes": "Diabetes Care",
        "heart-care": "Heart Care",
        "stomach-care": "Stomach Care",
        "liver-care": "Liver Care",
        "bone-joint-muscle-care": "Bone & Joint Care",
        "kidney-care": "Kidney Care",
        "derma-care": "Derma Care",
        "respiratory-care": "Respiratory Care"
    };

    const targetCategory = categoryMap[categoryName] || categoryName;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                // --- USING THE SERVICE HERE ---
                const data = await inventoryService.getProductsByCategory(targetCategory);
                setDynamicProducts(data);

            } catch (error) {
                // You could set an error state here to show a message to the user
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [targetCategory]);
    const displayTitle = targetCategory || categoryName.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

    return (
        <div style={{ paddingBottom: "60px" }}>
            {loading ? (
                <div style={{ textAlign: "center", padding: "50px", fontSize: "1.2rem" }}>
                    Loading {displayTitle}...
                </div>
            ) : (
                <ProductList
                    categoryTitle={displayTitle}
                    products={dynamicProducts}
                />
            )}
        </div>
    );
};

export default CategoryPage;
