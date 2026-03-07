import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Package, Plus, X } from "lucide-react";
import "./myMedicine.css";

const MyMedicine = () => {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([
    { id: 1, name: "Amoxicillin 500mg", category: "Antibiotics", price: 12.5, stock: 450 },
    { id: 2, name: "Metformin 850mg", category: "Diabetes", price: 6.75, stock: 0 },
    { id: 3, name: "Omeprazole 20mg", category: "Antibiotics", price: 11.0, stock: 120 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [newStock, setNewStock] = useState("");

  // Delete
  const handleDelete = (id) => {
    setMedicines(medicines.filter((med) => med.id !== id));
  };

  // Open Modal
  const openStockModal = (med) => {
    setSelectedMedicine(med);
    setNewStock(med.stock);
    setShowModal(true);
  };

  // Update Stock
  const handleUpdateStock = () => {
    setMedicines(
      medicines.map((med) =>
        med.id === selectedMedicine.id
          ? { ...med, stock: Number(newStock) }
          : med
      )
    );
    setShowModal(false);
  };

  return (
    <>
      <div className="dashboard-header medicine-header">
        <div>
          <h1 className="dashboard-title">My Medicines</h1>
          <p className="dashboard-subtitle">
            View and manage your listed medicines
          </p>
        </div>

        <button
          className="add-medicine-btn"
          onClick={() =>
            navigate("/supplier-dashboard/add-medicine")
          }
        >
          <Plus size={16} />
          Add Medicine
        </button>
      </div>

      <div className="medicine-table">
        <div className="table-header">
          <span>Medicine Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Actions</span>
        </div>

        {medicines.map((med) => (
          <div key={med.id} className="table-row">
            <span>{med.name}</span>
            <span>{med.category}</span>
            <span>${med.price.toFixed(2)}</span>
            <span>{med.stock}</span>

            <span className="table-actions">
              <Pencil
                size={18}
                className="action-icon"
                onClick={() =>
                  navigate("/supplier-dashboard/add-medicine")
                }
              />

              <Package
                size={18}
                className="action-icon"
                onClick={() => openStockModal(med)}
              />

              <Trash2
                size={18}
                className="action-icon delete-icon"
                onClick={() => handleDelete(med.id)}
              />
            </span>
          </div>
        ))}
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Stock</h2>
              <X
                size={20}
                className="close-icon"
                onClick={() => setShowModal(false)}
              />
            </div>

            <label>New Stock Quantity</label>
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="modal-update"
                onClick={handleUpdateStock}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyMedicine;