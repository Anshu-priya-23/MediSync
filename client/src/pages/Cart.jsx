import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import "./orderFlow.css";

const Cart = () => {
  const { cart, updateItem, removeItem, clearCart, loading } = useContext(CartContext);
  console.log(cart);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedAddress, setSelectedAddress] = useState(
    () => localStorage.getItem("selectedAddress") || ""
  );

  const subtotal = Number(cart.subtotal || 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const defaultAddress = useMemo(() => {
    if (!user?.name) {
      return "";
    }

    return `${user.name}, Campus Medical Pickup Desk`;
  }, [user]);

  const onAdjust = async (medicineId, nextQuantity) => {
    try {
      await updateItem(medicineId, nextQuantity);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update quantity");
    }
  };

  const onRemove = async (medicineId) => {
    try {
      await removeItem(medicineId);
      toast.success("Item removed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to remove item");
    }
  };

  const onClear = async () => {
    try {
      await clearCart();
      toast.success("Cart cleared");
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to clear cart");
    }
  };

  const onProceed = () => {
    const normalized = String(selectedAddress || defaultAddress).trim();
    if (!normalized) {
      toast.error("Please enter pickup address");
      return;
    }

    localStorage.setItem("selectedAddress", normalized);
    navigate("/checkout", {
      state: {
        selectedAddress: normalized,
      },
    });
  };

  return (
    <main className="order-page">
      <h1 className="order-page-title">Your Cart</h1>
      <p className="order-page-subtitle">Review medicines, adjust quantity, and continue to checkout.</p>

      {!cart.items.length ? (
        <section className="order-panel empty-state">
          <p className="cart-muted">Your cart is empty.</p>
          <Link className="btn-primary" to="/shop">
            Continue Shopping
          </Link>
        </section>
      ) : (
        <section className="order-grid">
          <section className="order-panel cart-items-wrap">
            {cart.items.map((item) => (
              <article key={item.medicineId} className="cart-item">
                <img
                  className="cart-image"
                  src={
                    String(item.imageData || "").trim() ||
                    "https://placehold.co/300x300/f5f8fb/9aaec1?text=Medicine"
                  }
                  alt={item.medicineName}
                />

                <div>
                  <div className="cart-head">
                    <div>
                      <h3 className="cart-name">{item.medicineName}</h3>
                      <span className="cart-muted">{item.category || "General"}</span>
                    </div>

                    <button className="btn-danger" type="button" onClick={() => onRemove(item.medicineId)}>
                      Remove
                    </button>
                  </div>

                  <div className="cart-row">
                    <span className="cart-muted">Unit Price: Rs {Number(item.unitPrice || 0).toFixed(2)}</span>

                    <div className="qty-stepper">
                      <button
                        type="button"
                        disabled={loading || Number(item.quantity || 0) <= 1}
                        onClick={() => onAdjust(item.medicineId, Math.max(1, Number(item.quantity || 1) - 1))}
                      >
                        -
                      </button>
                      <span className="qty-value">{Number(item.quantity || 0)}</span>
                      <button
                        type="button"
                        disabled={loading || Number(item.quantity || 0) >= 20}
                        onClick={() => onAdjust(item.medicineId, Math.min(20, Number(item.quantity || 1) + 1))}
                      >
                        +
                      </button>
                    </div>

                    <strong>Rs {Number(item.lineTotal || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="order-panel side-wrap">
            <section className="side-card">
              <h3 className="side-title">Pickup Address</h3>
              <input
                className="form-input"
                value={selectedAddress}
                onChange={(event) => setSelectedAddress(event.target.value)}
                placeholder={defaultAddress || "Enter pickup address"}
              />
              <p className="note" style={{ marginBottom: 0 }}>
                Add building/hostel and room details for smooth pickup.
              </p>
            </section>

            <section className="side-card">
              <h3 className="side-title">Billing Summary</h3>
              <div className="bill-row">
                <span>Items</span>
                <strong>{cart.totalItems}</strong>
              </div>
              <div className="bill-row">
                <span>Subtotal</span>
                <strong>Rs {subtotal.toFixed(2)}</strong>
              </div>
              <div className="bill-row">
                <span>Tax (5%)</span>
                <strong>Rs {tax.toFixed(2)}</strong>
              </div>
              <div className="bill-total">
                <span>Total</span>
                <span>Rs {total.toFixed(2)}</span>
              </div>

              <div className="btn-row" style={{ marginTop: 12 }}>
                <button className="btn-secondary" type="button" onClick={onClear}>
                  Clear Cart
                </button>
                <button className="btn-primary" type="button" disabled={loading} onClick={onProceed}>
                  Proceed
                </button>
              </div>
            </section>
          </aside>
        </section>
      )}
    </main>
  );
};

export default Cart;
