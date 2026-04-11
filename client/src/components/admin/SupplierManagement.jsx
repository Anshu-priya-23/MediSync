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
        <h2>Suppliers</h2>
      </div>

      {/* Table */}
      <div className="supplier-table-container">
        <table>
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Supplier Name</th>
              <th>Email</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty">
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, index) => (
                <tr key={supplier._id || index}>
                  <td>{supplier._id}</td>
                  <td>{supplier.name}</td>
                  <td>{supplier.email || "-"}</td>
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