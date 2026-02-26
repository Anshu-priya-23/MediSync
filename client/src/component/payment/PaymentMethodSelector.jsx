import React from "react";

const PaymentMethodSelector = ({ selectedMethod, setSelectedMethod }) => {
  const methods = ["UPI", "Card", "Net Banking", "Cash on Delivery"];

  return (
    <div style={styles.card}>
      <h3 style={styles.heading}>Select Payment Method</h3>

      {methods.map((method) => (
        <label key={method} style={styles.option}>
          <input
            type="radio"
            checked={selectedMethod === method}
            onChange={() => setSelectedMethod(method)}
          />
          {method}
        </label>
      ))}
    </div>
  );
};

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
    boxSizing: "border-box",
  },
  heading: {
    color: "#24aeb1",
    marginBottom: "15px",
  },
  option: {
    display: "block",
    marginBottom: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default PaymentMethodSelector;
