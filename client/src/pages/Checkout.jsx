import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CartContext } from "../context/CartContext";
import { checkoutCart, fetchPickupSlots } from "../services/orderService";
import "./orderFlow.css";

const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 5 * 60 + 30;
const SLOT_LEAD_TIME_MINUTES = 60;

const toIstDateParts = (date) => {
  const istPseudoDate = new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  return {
    year: istPseudoDate.getUTCFullYear(),
    monthIndex: istPseudoDate.getUTCMonth(),
    day: istPseudoDate.getUTCDate(),
  };
};

const createUtcDateFromIstParts = (year, monthIndex, day, hour, minute = 0) =>
  new Date(Date.UTC(year, monthIndex, day, hour, minute, 0, 0) - IST_OFFSET_MINUTES * 60 * 1000);

const getSlotStartAt = (slot) => {
  const rawDate = slot?.date;
  if (!rawDate) {
    return null;
  }

  const baseDate = new Date(rawDate);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  const label = String(slot?.label || "");
  const match = label.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (!match) {
    return baseDate;
  }

  const startHour = Math.min(23, Math.max(0, Number(match[1])));
  const startMinute = Math.min(59, Math.max(0, Number(match[2])));
  const istParts = toIstDateParts(baseDate);
  return createUtcDateFromIstParts(istParts.year, istParts.monthIndex, istParts.day, startHour, startMinute);
};

const toFutureIstSlots = (items) => {
  const cutoffMs = Date.now() + SLOT_LEAD_TIME_MINUTES * 60 * 1000;

  return (Array.isArray(items) ? items : [])
    .map((slot) => ({ ...slot, _slotStartAt: getSlotStartAt(slot) }))
    .filter((slot) => slot._slotStartAt && slot._slotStartAt.getTime() > cutoffMs)
    .sort((a, b) => a._slotStartAt.getTime() - b._slotStartAt.getTime());
};

const Checkout = () => {
  const { cart, refreshCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");
  const [note, setNote] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const selectedAddress =
    location.state?.selectedAddress || localStorage.getItem("selectedAddress") || "";

  useEffect(() => {
    if (!selectedAddress) {
      toast.error("Please provide pickup address in cart first");
      navigate("/cart", { replace: true });
    }
  }, [selectedAddress, navigate]);

  useEffect(() => {
    let active = true;

    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const items = await fetchPickupSlots();
        if (!active) {
          return;
        }

        const futureSlots = toFutureIstSlots(items);
        setSlots(futureSlots);
        setSlotId(futureSlots[0]?.id || "");
      } catch (err) {
        if (active) {
          toast.error(err.response?.data?.message || "Unable to load pickup slots");
        }
      } finally {
        if (active) {
          setLoadingSlots(false);
        }
      }
    };

    loadSlots();

    return () => {
      active = false;
    };
  }, []);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === slotId),
    [slots, slotId]
  );

  const subtotal = Number(cart.subtotal || 0);
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const handleCheckout = async () => {
    if (!selectedSlot) {
      toast.error("Please select pickup slot");
      return;
    }

    setPlacingOrder(true);
    try {
      const order = await checkoutCart({
        pickupSlot: {
          date: selectedSlot.date,
          label: selectedSlot.label,
        },
        address: selectedAddress,
        note,
      });

      await refreshCart();
      navigate(`/payments/${order.id}`, {
        state: { order },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cart.items.length) {
    return (
      <main className="order-page">
        <h1 className="order-page-title">Checkout</h1>
        <section className="order-panel empty-state">
          <p className="cart-muted">Your cart is empty. Add medicines before checkout.</p>
          <Link to="/shop" className="btn-primary">
            Go To Shop
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="order-page">
      <h1 className="order-page-title">Checkout</h1>
      <p className="order-page-subtitle">Confirm address, slot, and continue to payment.</p>

      <section className="order-grid">
        <section className="order-panel side-wrap">
          <section className="side-card">
            <h3 className="side-title">Pickup Address</h3>
            <div className="form-input" style={{ background: "#f8fbfe" }}>
              {selectedAddress || "Address not selected"}
            </div>
            <div className="btn-row" style={{ marginTop: 10 }}>
              <Link to="/cart" className="btn-secondary">
                Change Address
              </Link>
            </div>
          </section>

          <section className="side-card">
            <h3 className="side-title">Pickup Slot</h3>
            {loadingSlots ? (
              <p className="cart-muted" style={{ margin: 0 }}>
                Loading slots...
              </p>
            ) : slots.length ? (
              <select
                className="form-select"
                value={slotId}
                onChange={(event) => setSlotId(event.target.value)}
              >
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {(slot._slotStartAt || new Date(slot.date)).toLocaleDateString("en-IN", {
                      timeZone: IST_TIME_ZONE,
                    })}{" "}
                    | {slot.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="cart-muted" style={{ margin: 0 }}>
                No future pickup slots are available right now. Please try again shortly.
              </p>
            )}
          </section>

          <section className="side-card">
            <h3 className="side-title">Order Note (Optional)</h3>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Add any instructions for the pharmacist"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </section>
        </section>

        <aside className="order-panel side-wrap">
          <section className="side-card">
            <h3 className="side-title">Summary</h3>
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

            <button
              className="btn-primary"
              style={{ width: "100%", marginTop: 12 }}
              type="button"
              disabled={placingOrder || loadingSlots || !selectedSlot}
              onClick={handleCheckout}
            >
              {placingOrder ? "Placing Order..." : "Continue To Payment"}
            </button>
          </section>
        </aside>
      </section>
    </main>
  );
};

export default Checkout;
