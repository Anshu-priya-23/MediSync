import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchOrderById } from "../services/orderService";
import "./orderFlow.css";

const formatMoney = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const OrderSuccess = () => {
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (order) {
      return;
    }

    let active = true;

    const loadOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const orderData = await fetchOrderById(orderId);
        if (active) {
          setOrder(orderData);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Unable to load order details");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      active = false;
    };
  }, [order, orderId]);

  return (
    <main className="order-page">
      <h1 className="order-page-title">Order Placed Successfully</h1>
      <p className="order-page-subtitle">
        Your payment is completed and your order has been recorded.
      </p>

      {loading ? <p className="cart-muted">Loading order details...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && order ? (
        <section className="order-panel side-wrap success-card">
          <div className="success-badge">Success</div>

          <div className="bill-row">
            <span>Order Number</span>
            <strong>{order.orderNumber || order.id || order._id}</strong>
          </div>
          <div className="bill-row">
            <span>Status</span>
            <span className={`order-status-pill ${order.status}`}>{order.status}</span>
          </div>
          <div className="bill-row">
            <span>Payment</span>
            <span className={`order-status-pill ${order.paymentStatus}`}>{order.paymentStatus}</span>
          </div>
          <div className="bill-row">
            <span>Placed At</span>
            <strong>{new Date(order.placedAt || order.createdAt).toLocaleString("en-IN")}</strong>
          </div>
          <div className="bill-row">
            <span>Pickup Slot</span>
            <strong>
              {order.pickupSlot?.date ? new Date(order.pickupSlot.date).toLocaleDateString("en-IN") : "N/A"}
              {order.pickupSlot?.label ? ` | ${order.pickupSlot.label}` : ""}
            </strong>
          </div>
          <div className="bill-row">
            <span>Pickup Address</span>
            <strong>{order.address || "N/A"}</strong>
          </div>

          <div className="order-items">
            {(order.items || []).map((item, index) => (
              <div className="order-item-line" key={`${item.medicineId || "item"}-${index}`}>
                <span>
                  {item.medicineName} x {item.quantity}
                </span>
                <strong>{formatMoney(item.lineTotal)}</strong>
              </div>
            ))}
          </div>

          <div className="bill-total">
            <span>Total</span>
            <span>{formatMoney(order.totalAmount)}</span>
          </div>

          <div className="btn-row" style={{ marginTop: 14 }}>
            <Link className="btn-primary" to="/profile" state={{ activeSection: "orders" }}>
              Go To Order History
            </Link>
            <Link className="btn-secondary" to="/shop">
              Go Back To Shopping
            </Link>
          </div>
        </section>
      ) : null}

      {!loading && !order ? (
        <section className="order-panel empty-state">
          <p className="cart-muted">Order details are not available right now.</p>
          <div className="btn-row" style={{ justifyContent: "center", marginTop: 8 }}>
            <Link className="btn-primary" to="/profile" state={{ activeSection: "orders" }}>
              Go To Order History
            </Link>
            <Link className="btn-secondary" to="/shop">
              Go Back To Shopping
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default OrderSuccess;
