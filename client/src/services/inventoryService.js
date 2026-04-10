import axios from "axios";
import { API_URL } from "./api";

const inventoryService = {
    /**
     * Fetches all medicines from the database
     */
    getAllMedicines: async () => {
        try {
            const response = await axios.get(`${API_URL}/medicines`);
            return response.data;
        } catch (error) {
            console.error("Error fetching all products:", error);
            throw error;
        }
    },

    /**
     * Fetches medicines based on a specific category slug
     */
    getProductsByCategory: async (categoryName) => {
        try {
            const safeCategory = encodeURIComponent(String(categoryName || "").trim());
            const response = await axios.get(`${API_URL}/medicines/category/${safeCategory}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching products for category: ${categoryName}`, error);
            throw error;
        }
    },

    /**
     * Fetches a single product by its unique ID
     */
    getProductById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/medicines/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching product with ID: ${id}`, error);
            throw error;
        }
    },

    getSupplierOrders: async (supplierId) => {
        try {
            // The URL matches your specific request format
            const response = await axios.get(`${API_URL}/orders/supplier/${supplierId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching supplier orders:", error);
            throw error;
        }
    },

    // Add this to your inventoryService object
    getSupplierStats: async (supplierId) => {
        try {
            const response = await axios.get(`${API_URL}/orders/stats/${supplierId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching supplier stats:", error);
            throw error;
        }
    },

    // Add this inside your inventoryService object
    getMedicineCount: async (supplierId) => {
        try {
            const response = await axios.get(`${API_URL}/medicines/count/${supplierId}`);
            return response.data; // Expecting { totalMedicines: 10 }
        } catch (error) {
            console.error("Error fetching medicine count:", error);
            throw error;
        }
    },

};

export default inventoryService;
