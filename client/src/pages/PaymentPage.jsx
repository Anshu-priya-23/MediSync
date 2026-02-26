import React, { useState } from "react";
import PaymentSummaryCard from "../component/payment/PaymentSummaryCard";
import PaymentMethodSelector from "../component/payment/PaymentMethodSelector";
import PaymentButton from "../component/payment/PaymentButton";
import PaymentLoader from "../component/payment/PaymentLoader";
import PaymentSuccess from "../component/payment/PaymentSuccess";
import PaymentFailure from "../component/payment/PaymentFailure";
import OrderPlacedCOD from "../component/payment/OrderPlacedCOD";

const PaymentPage = () => {
  const [method, setMethod] = useState("UPI");
  const [status, setStatus] = useState("idle");

  const cartItems = [
    { name: "Paracetamol", price: 100 },
    { name: "Vitamin C", price: 200 },
  ];

  const totalAmount = 300;
  const address = "VIT College Hostel, Room 101";

  const handlePayment = () => {
    // ✅ COD FLOW
    if (method === "Cash on Delivery") {
      setStatus("cod");
      return;
    }

    // ✅ Razorpay FLOW
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Check internet.");
      return;
    }

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // Test key
      amount: totalAmount * 100, // paisa
      currency: "INR",
      name: "MediSync Pharmacy",
      description: "Medicine Purchase",
      handler: function (response) {
        console.log(response);
        setStatus("success");
      },
      prefill: {
        name: "Vineesha",
        email: "test@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#24aeb1", // Netmeds teal
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function () {
      setStatus("failure");
    });

    rzp.open();
  };

  // STATUS SCREENS
  if (status === "loading") return <PaymentLoader />;
  if (status === "success") return <PaymentSuccess />;
  if (status === "failure") return <PaymentFailure />;
  if (status === "cod") return <OrderPlacedCOD />;

  return (
    <div style={styles.container}>
      <PaymentSummaryCard
        cartItems={cartItems}
        totalAmount={totalAmount}
        address={address}
      />

      <PaymentMethodSelector
        selectedMethod={method}
        setSelectedMethod={setMethod}
      />

      <PaymentButton
        amount={totalAmount}
        method={method}
        onClick={handlePayment}
      />
    </div>
  );
};

const styles = {
  container: {
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    padding: "20px",
    background: "#f0f6f7",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
};

export default PaymentPage;
