import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchOrderById } from "../services/orderService";
import { createPayment, fetchPaymentsByOrder, createStripeIntent } from "../services/paymentService";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import "./orderFlow.css";

// Load Stripe outside of component render to avoid recreating the object
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PAYMENT_METHODS = [
  { id: "card", label: "Card (Stripe)" },
  { id: "cod", label: "Cash on Delivery" },
];

const formatMoney = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

// We separate the actual form so it has access to useStripe() hooks
const CheckoutForm = ({ order, payments, setPayments, setOrder }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [paying, setPaying] = useState(false);

  const handlePay = async () => {
    if (!order) return;
    const resolvedOrderId = order.id || order._id;
    if (!resolvedOrderId) {
      toast.error("Order reference is missing");
      return;
    }

    setPaying(true);
    try {
      let finalStatus = "";
      let transactionRef = "";

      // === STRIPE FLOW ===
      if (selectedMethod === "card") {
        if (!stripe || !elements) {
          toast.error("Stripe has not loaded yet.");
          setPaying(false);
          return;
        }

        const { clientSecret } = await createStripeIntent({
          amount: order.totalAmount,
          orderId: resolvedOrderId,
        });

        const cardElement = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });

        if (error) {
          toast.error(error.message);
          setPaying(false);
          return;
        }

        if (paymentIntent.status === "succeeded") {
          finalStatus = "succeeded";
          transactionRef = paymentIntent.id;
        }
      } 
      // === COD FLOW ===
      else if (selectedMethod === "cod") {
        finalStatus = "pending"; // COD payments stay pending until physical delivery
      }

      // === SAVE TO OUR DATABASE ===
      const response = await createPayment({
        orderId: resolvedOrderId,
        orderNumber: order.orderNumber,
        amount: order.totalAmount,
        currency: order.currency || "INR",
        method: selectedMethod,
        forceStatus: finalStatus, 
        transactionRef: transactionRef, 
      });

      const payment = response.payment;
      if (payment) {
        setPayments((current) => [payment, ...current.filter((item) => item.id !== payment.id)]);
      }

      const payStatus = String(payment?.status || "").toLowerCase();
      
      // 🚀 CHANGED: Redirect to success if Stripe succeeded OR if COD is pending
      if (payStatus === "succeeded" || (selectedMethod === "cod" && payStatus === "pending")) {
        
        // 🚀 THE FIX: Payment is pending for COD, but Order status is 'succeeded'
        const updatedPaymentStatus = selectedMethod === "cod" ? "pending" : "paid";
        
        const updatedOrder = { 
          ...order, 
          paymentStatus: updatedPaymentStatus, 
          status: "succeeded" // Order succeeds regardless of immediate payment in COD
        };
        
        setOrder(updatedOrder);
        
        toast.success(selectedMethod === "cod" ? "Order placed successfully! Pay on delivery." : "Payment successful!");
        navigate(`/orders/success/${resolvedOrderId}`, {
          state: { order: updatedOrder, payment },
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

      {/* STRIPE CARD INPUT UI */}
      {selectedMethod === "card" && (
        <div style={{ marginTop: "15px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>
      )}

      <p className="note" style={{ marginTop: 10 }}>
        {selectedMethod === "card" 
          ? "Secured by Stripe. Use 4242 4242 4242 4242 for testing." 
          : "Pay with cash when your medicine is delivered."}
      </p>

      <div className="btn-row" style={{ marginTop: 10 }}>
        <button className="btn-primary" type="button" disabled={paying} onClick={handlePay}>
          {paying 
            ? "Processing..." 
            : selectedMethod === "cod" 
              ? `Place Order (COD)` 
              : `Pay ${formatMoney(order.totalAmount)}`}
        </button>
        <Link to="/profile" state={{ activeSection: "orders" }} className="btn-secondary">
          Back To Order History
        </Link>
      </div>
    </section>
  );
};

// Main Page Wrapper
const PaymentPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const latestPayment = useMemo(() => payments[0] || null, [payments]);
  
  // 🚀 CHANGED: Now also checks if the order status is already succeeded (for COD returns)
  const isPaidOrPlaced =
    String(order?.paymentStatus || "").toLowerCase() === "paid" ||
    String(latestPayment?.status || "").toLowerCase() === "succeeded" ||
    String(order?.status || "").toLowerCase() === "succeeded";

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [orderData, paymentItems] = await Promise.all([
          fetchOrderById(orderId),
          fetchPaymentsByOrder(orderId),
        ]);
        if (!active) return;
        setOrder(orderData);
        setPayments(paymentItems);
      } catch (err) {
        if (active) setError(err.response?.data?.message || "Unable to load payment details");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [orderId]);

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
              <div className="bill-row"><span>Order</span><strong>{order.orderNumber || order.id}</strong></div>
              <div className="bill-row"><span>Status</span><span className={`order-status-pill ${order.status}`}>{order.status}</span></div>
            </section>

            {!isPaidOrPlaced ? (
              // Wrapped in Elements Provider for Stripe
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  order={order} 
                  payments={payments} 
                  setPayments={setPayments} 
                  setOrder={setOrder} 
                />
              </Elements>
            ) : (
              <section className="side-card">
                <h3 className="side-title">Order Confirmed</h3>
                <p className="note">This order has already been processed.</p>
                <Link to="/profile" state={{ activeSection: "orders" }} className="btn-primary">View Order History</Link>
              </section>
            )}
          </section>

          {/* BILL SUMMARY ASIDE KEEPS EXACT SAME UI */}
          <aside className="order-panel side-wrap">
            <section className="side-card">
              <h3 className="side-title">Bill Summary</h3>
              <div className="bill-total">
                <span>Total</span><span>{formatMoney(order.totalAmount)}</span>
              </div>
            </section>
          </aside>
        </section>
      ) : null}
    </main>
  );
};

export default PaymentPage;