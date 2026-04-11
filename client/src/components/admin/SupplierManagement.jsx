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
      console.error("Error fetching suppliers:", err);
    }
  };

  return (
    <div className="supplier-page">

      {/* HEADER */}
      <div className="supplier-header">
        <h2>Suppliers</h2>
      </div>

      {/* TABLE */}
      <div className="supplier-table-container">
        <table>
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Supplier Name</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan="2" className="empty">
                  No suppliers found
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, index) => (
                <tr key={supplier._id || index}>
                  <td>{supplier._id}</td>
                  <td>{supplier.name}</td>
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