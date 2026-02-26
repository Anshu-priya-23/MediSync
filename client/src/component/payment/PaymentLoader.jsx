import React from "react";

const PaymentLoader = () => {
  return (
    <div style={styles.container}>
      <h2>Processing Payment...</h2>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
  },
};

export default PaymentLoader;
