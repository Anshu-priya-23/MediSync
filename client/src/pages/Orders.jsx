import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchOrders } from "../services/orderService";
import { CartContext } from "../context/CartContext";
import "./orderFlow.css";

const formatMoney = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const Orders = () => {
  const navigate = useNavigate();
  const { addItem, refreshCart } = useContext(CartContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reorderingOrderId, setReorderingOrderId] = useState("");

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const items = await fetchOrders();
        if (active) {
          setOrders(items);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Unable to load orders");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const onOrderAgain = async (order) => {
    if (!order?.items?.length) {
      toast.error("No medicines found in this order");
      return;
    }

    setReorderingOrderId(order.id);
    try {
      for (const item of order.items) {
        await addItem(item.medicineId, item.quantity);
      }
      await refreshCart();
      toast.success("Items added to cart");
      navigate("/cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to reorder now");
    } finally {
      setReorderingOrderId("");
    }
  };

  return (
    <main className="order-page">
      <h1 className="order-page-title">Order History</h1>
      <p className="order-page-subtitle">Track your medicine orders and complete pending payments.</p>

      {loading ? <p className="cart-muted">Loading orders...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && !error && !orders.length ? (
        <section className="order-panel empty-state">
          <p className="cart-muted">No orders found yet.</p>
          <Link to="/shop" className="btn-primary">
            Start Shopping
          </Link>
        </section>
      ) : null}

      <section className="order-list">
        {orders.map((order) => (
          <article className="order-panel order-card" key={order.id}>
            <div className="order-card-head">
              <div>
                <strong>{order.orderNumber || order.id}</strong>
                <p className="cart-muted" style={{ margin: "4px 0 0" }}>
                  {new Date(order.placedAt || order.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span className={`order-status-pill ${order.status}`}>{order.status}</span>
                <p className="cart-muted" style={{ margin: "6px 0 0" }}>
                  Payment: {order.paymentStatus}
                </p>
              </div>
            </div>

            <div className="order-items">
              {order.items.map((item, index) => (
                <div className="order-item-line" key={`${order.id}-${item.medicineId || index}`}>
                  <span>
                    {item.medicineName} x {item.quantity}
                  </span>
                  <strong>{formatMoney(item.lineTotal)}</strong>
                </div>
              ))}
            </div>

            <div className="bill-total" style={{ marginTop: 12 }}>
              <span>Total</span>
              <span>{formatMoney(order.totalAmount)}</span>
            </div>

            <div className="btn-row" style={{ marginTop: 12 }}>
              {String(order.paymentStatus || "").toLowerCase() !== "paid" ? (
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => navigate(`/payments/${order.id}`, { state: { order } })}
                >
                  Complete Payment
                </button>
              ) : null}

              <button
                className="btn-secondary"
                type="button"
                onClick={() => onOrderAgain(order)}
                disabled={reorderingOrderId === order.id}
              >
                {reorderingOrderId === order.id ? "Adding..." : "Order Again"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Orders;
