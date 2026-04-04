import React, { useState, useEffect } from "react";
import "./SupplierManagement.css";
import axios from "axios";

const API = "http://localhost:5005/api/analytics/suppliers";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);

  // FETCH SUPPLIERS
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(API);
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="supplier-page">

      {/* Header */}
      <div className="supplier-header">
        <h2>Supplier Management</h2>
      </div>

      {/* Table */}
      <div className="supplier-table-container">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, index) => (
                <tr key={supplier._id || index}>
                  <td>{supplier.name}</td>
                  <td>{supplier.email || "-"}</td>
                  <td>
                    <span className={`status ${(supplier.status || "Active").toLowerCase()}`}>
                      {supplier.status || "Active"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
};

export default SupplierManagement;