import React from "react";

const PaymentButton = ({ amount, method, onClick }) => {
  const text = method === "Cash on Delivery" ? "Place Order" : `Pay ₹${amount}`;

  return (
    <button style={styles.button} onClick={onClick}>
      {text}
    </button>
  );
};

const styles = {
  button: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#24aeb1",
    color: "#fff",
    fontSize: "18px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    boxSizing: "border-box",
  },
};

export default PaymentButton;
