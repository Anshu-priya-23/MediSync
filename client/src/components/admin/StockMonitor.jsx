import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import "./StockMonitor.css";

const StockMonitor = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [supplierFilter, setSupplierFilter] = useState("All Suppliers");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "Amoxicillin 500mg",
      category: "Antibiotics",
      supplier: "PharmaCorp Ltd",
      stock: 450,
      min: 100,
      expiry: "2026-08-15",
    },
    {
      id: 2,
      name: "Ibuprofen 400mg",
      category: "Painkillers",
      supplier: "MedSupply Inc",
      stock: 85,
      min: 100,
      expiry: "2026-05-20",
    },
    {
      id: 3,
      name: "Vitamin D3 1000IU",
      category: "Vitamins",
      supplier: "HealthFirst Pharma",
      stock: 320,
      min: 50,
      expiry: "2027-01-10",
    },
  ]);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);

  const getStatus = (stock, min) => {
    if (stock === 0) return "Out of Stock";
    if (stock < min) return "Low Stock";
    return "In Stock";
  };

  const filtered = medicines.filter((med) => {
    const status = getStatus(med.stock, med.min);

    return (
      med.name.toLowerCase().includes(search.toLowerCase()) &&
      (categoryFilter === "All Categories" ||
        med.category === categoryFilter) &&
      (supplierFilter === "All Suppliers" ||
        med.supplier === supplierFilter) &&
      (statusFilter === "All Status" || status === statusFilter)
    );
  });

  // EDIT
  const handleEdit = (med) => {
    setSelectedMed({ ...med });
    setEditOpen(true);
  };

  const handleSave = () => {
    setMedicines(
      medicines.map((m) =>
        m.id === selectedMed.id ? selectedMed : m
      )
    );
    setEditOpen(false);
  };

  // DELETE
  const handleDeleteClick = (med) => {
    setSelectedMed(med);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    setMedicines(medicines.filter((m) => m.id !== selectedMed.id));
    setDeleteOpen(false);
  };

  return (
    <div className="stock-page">
      <h2>Stock Monitor</h2>
     

      {/* Filters */}
      <div className="filters">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option>All Categories</option>
          <option>Antibiotics</option>
          <option>Painkillers</option>
          <option>Vitamins</option>
        </select>

        <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
          <option>All Suppliers</option>
          <option>PharmaCorp Ltd</option>
          <option>MedSupply Inc</option>
          <option>HealthFirst Pharma</option>
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>

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

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Category</th>
              <th>Supplier</th>
              <th>Stock</th>
              <th>Min Threshold</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((med) => {
              const status = getStatus(med.stock, med.min);

              return (
                <tr key={med.id}>
                  <td>{med.name}</td>
                  <td>{med.category}</td>
                  <td>{med.supplier}</td>
                  <td>{med.stock}</td>
                  <td>{med.min}</td>
                  <td>{med.expiry}</td>
                  <td>
                    <span className={`status ${status.replace(" ", "")}`}>
                      {status}
                    </span>
                  </td>
                  <td className="actions">
                    <FiEdit2
                      className="edit-icon"
                      onClick={() => handleEdit(med)}
                    />
                    <FiTrash2
                      className="delete-icon"
                      onClick={() => handleDeleteClick(med)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Medicine</h3>
            </div>

            <label>Name</label>
            <input
              value={selectedMed.name}
              onChange={(e) =>
                setSelectedMed({ ...selectedMed, name: e.target.value })
              }
            />

            <label>Category</label>
            <input
              value={selectedMed.category}
              onChange={(e) =>
                setSelectedMed({ ...selectedMed, category: e.target.value })
              }
            />

            <label>Supplier</label>
            <input
              value={selectedMed.supplier}
              onChange={(e) =>
                setSelectedMed({ ...selectedMed, supplier: e.target.value })
              }
            />

            <label>Stock</label>
            <input
              type="number"
              value={selectedMed.stock}
              onChange={(e) =>
                setSelectedMed({ ...selectedMed, stock: Number(e.target.value) })
              }
            />

            <label>Min Threshold</label>
            <input
              type="number"
              value={selectedMed.min}
              onChange={(e) =>
                setSelectedMed({ ...selectedMed, min: Number(e.target.value) })
              }
            />

            <label>Expiry</label>
            <input
              type="date"
              value={selectedMed.expiry}
              onChange={(e) =>
                setSelectedMed({ ...selectedMed, expiry: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteOpen && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <h3>Delete Medicine</h3>
            <p>Are you sure you want to delete this medicine?</p>

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setDeleteOpen(false)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMonitor;