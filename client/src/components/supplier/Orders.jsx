import React, { useEffect, useMemo, useState } from "react";
import "./orders.css";
import inventoryService from "../../services/inventoryService";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const supplierId = useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId || null;
    } catch (_error) {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supplierId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await inventoryService.getSupplierOrders(supplierId);
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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
            (order.medicines || []).map((med, index) => (
              <div key={`${order._id || order.orderNumber}-${index}`} className="orders-row">
                <span className="order-id">
                  {(order.orderNumber || order._id || "").toString().slice(-12).toUpperCase()}
                </span>
                <span>{order.customerName || "N/A"}</span>
                <span className="medicine-name">
                  <strong>{med.name}</strong>
                </span>
                <span>{med.quantity}</span>
                <span>Rs {med.price}</span>
                <span>Rs {order.supplierTotal ?? order.totalAmount}</span>
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
