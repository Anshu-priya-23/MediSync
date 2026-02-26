import React from "react";

const PaymentSummaryCard = ({ cartItems, totalAmount, address }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Order Summary</h3>

      {cartItems.map((item, index) => (
        <div key={index} style={styles.itemRow}>
          <span>{item.name}</span>
          <span>₹{item.price}</span>
        </div>
      ))}

      <hr />

      <div style={styles.totalRow}>
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </div>

      <div style={styles.total}>
        <strong>Total</strong>
        <strong style={{ color: "#24aeb1" }}>₹{totalAmount}</strong>
      </div>

      <div style={styles.addressBox}>
        <strong>Delivery Address</strong>
        <p>{address}</p>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "20px",
    width: "100%",
    boxSizing: "border-box",
  },
  heading: {
    color: "#24aeb1",
    marginBottom: "15px",
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  total: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "18px",
    marginTop: "10px",
  },
  addressBox: {
    marginTop: "15px",
    background: "#f7fafa",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
  },
};

export default PaymentSummaryCard;
