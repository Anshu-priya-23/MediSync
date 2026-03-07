import React from "react";
import "./orders.css";

const Orders = () => {
  const orders = [
    {
      id: "ORD-001",
      medicine: "Amoxicillin 500mg",
      qty: 200,
      returned: 5,
      cancelled: 0,
      date: "2026-02-10",
      status: "Completed",
    },
    {
      id: "ORD-002",
      medicine: "Ibuprofen 400mg",
      qty: 150,
      returned: 0,
      cancelled: 10,
      date: "2026-02-12",
      status: "Completed",
    },
    {
      id: "ORD-003",
      medicine: "Vitamin D3 1000IU",
      qty: 100,
      returned: 20,
      cancelled: 0,
      date: "2026-02-15",
      status: "Returned",
    },
    {
      id: "ORD-004",
      medicine: "Atorvastatin 20mg",
      qty: 75,
      returned: 0,
      cancelled: 75,
      date: "2026-02-18",
      status: "Cancelled",
    },
    {
      id: "ORD-005",
      medicine: "Paracetamol 650mg",
      qty: 500,
      returned: 0,
      cancelled: 0,
      date: "2026-02-20",
      status: "Processing",
    },
  ];

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Orders</h1>
        <p className="dashboard-subtitle">
          View your order history and status
        </p>
      </div>

      <div className="orders-table">
        <div className="orders-header">
          <span>Order ID</span>
          <span>Medicine</span>
          <span>Qty Bought</span>
          <span>Returned</span>
          <span>Cancelled</span>
          <span>Order Date</span>
          <span>Status</span>
        </div>

        {orders.map((order, index) => (
          <div key={index} className="orders-row">
            <span className="order-id">{order.id}</span>
            <span>{order.medicine}</span>
            <span>{order.qty}</span>
            <span className="returned">{order.returned}</span>
            <span className="cancelled">{order.cancelled}</span>
            <span>{order.date}</span>
            <span>
              <span className={`status-badge ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Orders;