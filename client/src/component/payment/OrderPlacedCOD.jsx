import React from "react";

const OrderPlacedCOD = () => {
  return (
    <div style={styles.container}>
      <h2 style={{ color: "#24aeb1" }}>Order Placed ✅</h2>
      <p>You will pay at the time of delivery.</p>
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

export default OrderPlacedCOD;
