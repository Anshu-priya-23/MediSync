import React, { useState } from "react";
import "./addMedicine.css";

const AddMedicine = () => {

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    threshold: "",
    expiry: "",
    batch: "",
    description: "",
    image: null,
  });

  // ✅ DEFINE ACTIVE BUTTON STATE (THIS WAS MISSING)
  const [activeBtn, setActiveBtn] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveBtn("save");   // highlight save
    console.log(formData);
  };

  const handleCancel = () => {
    setActiveBtn("cancel"); // highlight cancel
    setFormData({
      name: "",
      sku: "",
      category: "",
      price: "",
      stock: "",
      threshold: "",
      expiry: "",
      batch: "",
      description: "",
      image: null,
    });
  };

  return (
    <>
      <div className="add-page-header">
        <h1 className="add-page-title">Add Medicine</h1>
        <p className="add-page-subtitle">
          Add a new medicine to your inventory
        </p>
      </div>

      <div className="add-form-container">
        <form onSubmit={handleSubmit}>
          <div className="add-form-grid">

            <div>
              <label className="add-label">Medicine Name</label>
              <input
                type="text"
                name="name"
                className="add-input"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="add-label">SKU Code</label>
              <input
                type="text"
                name="sku"
                className="add-input"
                value={formData.sku}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="add-label">Category</label>
              <select
                name="category"
                className="add-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="Tablet">Tablet</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
              </select>
            </div>

            <div>
              <label className="add-label">Price ($)</label>
              <input
                type="number"
                name="price"
                className="add-input"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="add-label">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                className="add-input"
                value={formData.stock}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="add-label">Minimum Threshold</label>
              <input
                type="number"
                name="threshold"
                className="add-input"
                value={formData.threshold}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="add-label">Expiry Date</label>
              <input
                type="date"
                name="expiry"
                className="add-input"
                value={formData.expiry}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="add-label">Batch Number</label>
              <input
                type="text"
                name="batch"
                className="add-input"
                value={formData.batch}
                onChange={handleChange}
              />
            </div>

            <div className="add-full-width">
              <label className="add-label">Description</label>
              <textarea
                name="description"
                className="add-textarea"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="add-full-width">
              <label className="add-label">Image Upload</label>
              <input
                type="file"
                name="image"
                className="add-input"
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="add-form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className={`add-btn-cancel ${activeBtn === "cancel" ? "active-btn" : ""}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`add-btn-save ${activeBtn === "save" ? "active-btn" : ""}`}
            >
              Save Medicine
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default AddMedicine;