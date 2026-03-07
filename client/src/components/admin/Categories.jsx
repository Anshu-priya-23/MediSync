import React, { useState } from "react";
import "./Categories.css";
import { FiEdit2, FiTrash2, FiPlus, FiX } from "react-icons/fi";

const Categories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Antibiotics",
      description: "Anti-bacterial medicines",
      total: 45,
    },
    {
      id: 2,
      name: "Painkillers",
      description: "Pain relief medicines",
      total: 32,
    },
     {
      id: 1,
      name: "Antibiotics",
      description: "Anti-bacterial medicines",
      total: 45,
    },
    {
      id: 2,
      name: "Painkillers",
      description: "Pain relief medicines",
      total: 32,
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // ===== OPEN ADD =====
  const openAdd = () => {
    setIsEdit(false);
    setFormData({ name: "", description: "" });
    setShowModal(true);
  };

  // ===== OPEN EDIT =====
  const openEdit = (cat) => {
    setIsEdit(true);
    setSelectedId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description,
    });
    setShowModal(true);
  };

  // ===== SAVE =====
  const handleSave = () => {
    if (!formData.name) return;

    if (isEdit) {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedId
            ? { ...cat, name: formData.name, description: formData.description }
            : cat
        )
      );
    } else {
      const newItem = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        total: 0,
      };
      setCategories([...categories, newItem]);
    }

    setShowModal(false);
  };

  // ===== OPEN DELETE =====
  const openDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  // ===== CONFIRM DELETE =====
  const confirmDelete = () => {
    setCategories(categories.filter((cat) => cat.id !== selectedId));
    setShowDeleteModal(false);
  };

  return (
    <div className="categories-page">

      {/* HEADER */}
      <div className="categories-header">
        <div>
          <h2>Categories</h2>
         
        </div>

        <button className="add-btn" onClick={openAdd}>
          <FiPlus /> Add Category
        </button>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>{cat.total}</td>
                <td className="actions">
                  <FiEdit2
                    className="edit-icon"
                    onClick={() => openEdit(cat)}
                  />
                  <FiTrash2
                    className="edit-icon"
                    onClick={() => openDelete(cat.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{isEdit ? "Edit Category" : "Add Category"}</h3>
              <FiX onClick={() => setShowModal(false)} />
            </div>

            <label>Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <div className="modal-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
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
      
      {/* DELETE CONFIRM MODAL */}
{showDeleteModal && (
  <div className="modal-overlay">
    <div className="delete-modal">
      <h3>Delete Category?</h3>
      <p>This action cannot be undone.</p>

      <div className="delete-actions">
        <button onClick={() => setShowDeleteModal(false)}>
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

export default Categories;