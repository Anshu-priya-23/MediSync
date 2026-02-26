import React from "react";

const PaymentFailure = () => {
  return (
    <div style={styles.container}>
      <h2 style={{ color: "red" }}>Payment Failed ❌</h2>
      <p>Please try again.</p>
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

export default PaymentFailure;
