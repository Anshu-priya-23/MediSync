import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import "./StockMonitor.css";
import axios from "axios";

const API = "http://localhost:5005/api/analytics/stock";

const StockMonitor = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [medicines, setMedicines] = useState([]);

  // ✅ FETCH DATA
  useEffect(() => {
    axios.get(API)
      .then((res) => setMedicines(res.data || []))
      .catch((err) => {
        console.error(err);
        setMedicines([]);
      });
  }, []);

  // ✅ STATUS LOGIC
  const getStatus = (stock, min) => {
    if (stock === 0) return "Out of Stock";
    if (stock < min) return "Low Stock";
    return "In Stock";
  };

  // ✅ DYNAMIC FILTER OPTIONS
  const categories = ["All Categories", ...new Set(medicines.map(m => m.category))];
  const suppliers = ["All Suppliers", ...new Set(medicines.map(m => m.supplier))];

  // ✅ FILTER LOGIC
  const filtered = medicines.filter((med) => {
    const status = getStatus(med.stock, med.min);

    return (
      (med.name || "").toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "All Categories" || med.category === categoryFilter) &&
      (supplierFilter === "All Suppliers" || med.supplier === supplierFilter) &&
      (statusFilter === "All Status" || status === statusFilter)
    );
  });

  return (
    <div className="stock-page">
      <h2>Stock Monitor</h2>

      <div className="filters">

        {/* CATEGORY */}
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((cat, i) => (
            <option key={i}>{cat}</option>
          ))}
        </select>

        {/* SUPPLIER */}
        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
          {suppliers.map((sup, i) => (
            <option key={i}>{sup}</option>
          ))}
        </select>

        {/* STATUS */}
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>

        {/* SEARCH */}
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Stock</th>
              <th>Min Threshold</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  No data available
                </td>
              </tr>
            ) : (
              filtered.map((med) => {
                const status = getStatus(med.stock, med.min);

                return (
                  <tr key={med._id}>
                    <td>{med.name}</td>
                    <td>{med.category}</td>
                    <td>{med.supplier}</td>
                    <td>{med.stock}</td>
                    <td>{med.min}</td>
                    <td>{med.expiry ? med.expiry.split("T")[0]:"-"}</td>

                    {/* ✅ STATUS BADGE */}
                    <td>
                      <span className={`status ${status.replace(/\s/g, "")}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMonitor;