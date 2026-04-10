import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchOrderById } from "../services/orderService";
import { createPayment, fetchPaymentsByOrder } from "../services/paymentService";
import "./orderFlow.css";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI" },
  { id: "card", label: "Card" },
  { id: "netbanking", label: "Net Banking" },
];

const formatMoney = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const PaymentPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [paying, setPaying] = useState(false);

  const latestPayment = useMemo(() => payments[0] || null, [payments]);
  const isPaid =
    String(order?.paymentStatus || "").toLowerCase() === "paid" ||
    String(latestPayment?.status || "").toLowerCase() === "succeeded";

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [orderData, paymentItems] = await Promise.all([
          fetchOrderById(orderId),
          fetchPaymentsByOrder(orderId),
        ]);

        if (!active) {
          return;
        }

        setOrder(orderData);
        setPayments(paymentItems);
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Unable to load payment details");
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
  }, [orderId]);

  const subtotal = Number(order?.subtotal || 0);
  const tax = Number(order?.tax || 0);
  const deliveryFee = Number(order?.deliveryFee || 0);
  const total = Number(order?.totalAmount || 0);

  const handlePay = async () => {
    if (!order) {
      return;
    }

    const resolvedOrderId = order.id || order._id;
    if (!resolvedOrderId) {
      toast.error("Order reference is missing");
      return;
    }

    setPaying(true);
    try {
      const response = await createPayment({
        orderId: resolvedOrderId,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: order.currency || "INR",
        method: selectedMethod,
      });

      const payment = response.payment;

      if (payment) {
        setPayments((current) => [payment, ...current.filter((item) => item.id !== payment.id)]);
      }

      if (String(payment?.status || "").toLowerCase() === "succeeded") {
        const updatedOrder = {
          ...order,
          paymentStatus: "paid",
          status: "confirmed",
        };
        setOrder(updatedOrder);
        toast.success("Payment successful");
        navigate(`/orders/success/${resolvedOrderId}`, {
          state: {
            order: updatedOrder,
            payment,
          },
        });
        return;
      }

      toast.error(payment?.message || "Payment failed. Please try again.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to process payment");
    } finally {
      setPaying(false);
    }
  };

  return (
    <main className="order-page">
      <h1 className="order-page-title">Payment</h1>
      <p className="order-page-subtitle">Complete your order payment securely.</p>

      {loading ? <p className="cart-muted">Loading payment details...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {!loading && order ? (
        <section className="order-grid">
          <section className="order-panel side-wrap">
            <section className="side-card">
              <h3 className="side-title">Order Details</h3>
              <div className="bill-row">
                <span>Order</span>
                <strong>{order.orderNumber || order.id}</strong>
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
                <span>Pickup</span>
                <strong>
                  {order.pickupSlot?.date
                    ? new Date(order.pickupSlot.date).toLocaleDateString("en-IN")
                    : "N/A"}
                  {order.pickupSlot?.label ? ` | ${order.pickupSlot.label}` : ""}
                </strong>
              </div>
              <p className="note" style={{ marginBottom: 0 }}>
                Address: {order.address || "N/A"}
              </p>
            </section>

            {!isPaid ? (
              <section className="side-card">
                <h3 className="side-title">Choose Payment Method</h3>
                <div className="payment-method-grid">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      className={`payment-method-btn ${selectedMethod === method.id ? "active" : ""}`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                <p className="note" style={{ marginTop: 10 }}>
                  Demo mode: payment success/failure is simulated for local testing.
                </p>

                <div className="btn-row" style={{ marginTop: 10 }}>
                  <button className="btn-primary" type="button" disabled={paying} onClick={handlePay}>
                    {paying ? "Processing..." : `Pay ${formatMoney(order.totalAmount)}`}
                  </button>
                  <Link to="/profile" state={{ activeSection: "orders" }} className="btn-secondary">
                    Back To Order History
                  </Link>
                </div>
              </section>
            ) : (
              <section className="side-card">
                <h3 className="side-title">Payment Completed</h3>
                <p className="note">This order is already paid and confirmed.</p>
                <Link to="/profile" state={{ activeSection: "orders" }} className="btn-primary">
                  View Order History
                </Link>
              </section>
            )}
          </section>

          <aside className="order-panel side-wrap">
            <section className="side-card">
              <h3 className="side-title">Bill Summary</h3>
              <div className="bill-row">
                <span>Subtotal</span>
                <strong>{formatMoney(subtotal)}</strong>
              </div>
              <div className="bill-row">
                <span>Tax</span>
                <strong>{formatMoney(tax)}</strong>
              </div>
              <div className="bill-row">
                <span>Delivery Fee</span>
                <strong>{formatMoney(deliveryFee)}</strong>
              </div>
              <div className="bill-total">
                <span>Total</span>
                <span>{formatMoney(total)}</span>
              </div>
            </section>

            <section className="side-card">
              <h3 className="side-title">Transaction History</h3>
              {!payments.length ? (
                <p className="cart-muted" style={{ margin: 0 }}>
                  No payments yet.
                </p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} style={{ borderBottom: "1px dashed #deebf5", padding: "8px 0" }}>
                    <div className="bill-row" style={{ marginBottom: 4 }}>
                      <strong>{payment.paymentNumber}</strong>
                      <span className={`order-status-pill ${payment.status}`}>{payment.status}</span>
                    </div>
                    <div className="cart-muted">
                      {String(payment.method || "").toUpperCase()} | {payment.transactionRef || "N/A"}
                    </div>
                  </div>
                ))
              )}
            </section>
          </aside>
        </section>
      ) : null}
    </main>
  );
};

export default PaymentPage;
