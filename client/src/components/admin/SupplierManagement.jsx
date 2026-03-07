import React, { useState } from "react";
import "./SupplierManagement.css";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([
    {
      name: "PharmaCorp Ltd",
      email: "contact@pharmacorp.com",
      phone: "+1-555-0101",
      status: "Active",
    },
    {
      name: "MedSupply Inc",
      email: "info@medsupply.com",
      phone: "+1-555-0202",
      status: "Active",
    },
    {
      name: "HealthFirst Pharma",
      email: "sales@healthfirst.com",
      phone: "+1-555-0303",
      status: "Active",
    },
    {
      name: "CureAll Distributors",
      email: "hello@cureall.com",
      phone: "+1-555-0404",
      status: "Inactive",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "Active",
  });

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Open Add Modal
  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      status: "Active",
    });
    setIsEditing(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleEdit = (index) => {
    setFormData(suppliers[index]);
    setCurrentIndex(index);
    setIsEditing(true);
    setShowModal(true);
  };

  // Save Supplier
  const handleSave = () => {
    if (isEditing) {
      const updated = [...suppliers];
      updated[currentIndex] = formData;
      setSuppliers(updated);
    } else {
      setSuppliers([...suppliers, formData]);
    }
    setShowModal(false);
  };

  // Open Delete Modal
  const handleDelete = (index) => {
    setDeleteIndex(index);
  };

  // Confirm Delete
  const confirmDelete = () => {
    const updated = suppliers.filter((_, i) => i !== deleteIndex);
    setSuppliers(updated);
    setDeleteIndex(null);
  };

  return (
    <div className="supplier-page">

      {/* Header */}
      <div className="supplier-header">
        <div>
          <h2>Supplier Management</h2>
         
        </div>

        <button className="add-supplier-btn" onClick={handleAdd}>
          + Add Supplier
        </button>
      </div>

      {/* Table */}
      <div className="supplier-table-container">
        <table>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {suppliers.map((supplier, index) => (
              <tr key={index}>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone}</td>
                <td>
                  <span className={`status ${supplier.status.toLowerCase()}`}>
                    {supplier.status}
                  </span>
                </td>
                <td className="actions">
                  <FiEdit2
                    className="edit-icon"
                    onClick={() => handleEdit(index)}
                  />
                  <FiTrash2
                    className="delete-icon"
                    onClick={() => handleDelete(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-header">
              <h3>{isEditing ? "Edit Supplier" : "Add Supplier"}</h3>
              <FiX
                className="close-icon"
                onClick={() => setShowModal(false)}
              />
            </div>

            <label>Supplier Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <label>Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteIndex !== null && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Supplier?</h3>
            <p>This action cannot be undone.</p>

            <div className="delete-actions">
              <button onClick={() => setDeleteIndex(null)}>
                Cancel
              </button>

              <button
                className="delete-confirm"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupplierManagement;