import React, { useState, useEffect } from "react";
import "./orders.css";
import inventoryService from "../../services/inventoryService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supplier ID used for the API call
  const supplierId = "661111111111111111111111";

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getSupplierOrders(supplierId);
        // Ensure data is an array before setting state
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      fetchOrders();
    }
  }, [supplierId]);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Supplier Orders</h1>
        <p className="dashboard-subtitle">Manage incoming medicine requests</p>
      </div>

      <div className="orders-table">
        <div className="orders-header">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Medicine</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders" style={{ padding: "20px", textAlign: "center" }}>
            No orders found for this supplier.
          </div>
        ) : (
          orders.map((order) =>
            // Each order contains an array of medicines
            order.medicines.map((med, index) => (
              <div key={`${order._id}-${index}`} className="orders-row">
                {/* 1. Extract Order ID from the parent 'order' object */}
                <span className="order-id">
                  {order._id.substring(order._id.length - 8).toUpperCase()}
                </span>

                {/* 2. Extract Customer Name from the parent 'order' object */}
                <span>{order.customerName || "N/A"}</span>

                {/* 3. Medicine details come from the 'med' object inside the array */}
                <span className="medicine-name"><strong>{med.name}</strong></span>
                <span>{med.quantity}</span>
                <span>₹{med.price}</span>

                {/* 4. Total Amount and Status come from the parent 'order' object */}
                <span>₹{order.totalAmount}</span>
                <span>
                  <span className={`status-badge ${(order.status || "Pending").toLowerCase()}`}>
                    {order.status || "Pending"}
                  </span>
                </span>
              </div>
            ))
          )
        )}
      </div>
    </>
  );
};

export default Orders;