import React from "react";

const PaymentSuccess = () => {
  return (
    <div style={styles.container}>
      <h2 style={{ color: "green" }}>Payment Successful 🎉</h2>
      <p>Your order has been placed successfully.</p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default PaymentSuccess;
