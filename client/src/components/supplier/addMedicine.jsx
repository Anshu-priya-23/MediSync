import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./addMedicine.css";
import { API_URL, IMAGE_URL } from "../../services/api";

const AddMedicine = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    threshold: "",
    expiryDate: "",
    entryDate: "",
    batchNumber: "",
    description: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "medicine",
    "baby-care",
    "beauty",
    "wellness",
    "supplements",
    "personal-care",
    "health-devices",
    "herbal",
    "other",
  ];

  useEffect(() => {
    if (id) fetchMedicine();
  }, [id]);

  const fetchMedicine = async () => {
    try {
      const res = await axios.get(`${API_URL}/medicines/${id}`);
      const data = res.data;
      setFormData({
        name: data.name || "",
        category: data.category || "",
        price: data.price || "",
        stock: data.stock || "",
        threshold: data.minThreshold || "",
        expiryDate: data.expiryDate?.split("T")[0] || "",
        entryDate: data.entryDate?.split("T")[0] || "",
        batchNumber: data.batchNumber || "",
        description: data.description || "",
        image: null,
      });
      if (data.image) setPreview(`${IMAGE_URL}/uploads/${data.image}`);
    } catch (err) {
      console.error(err);
      alert("Failed to load medicine");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });
      if (file) setPreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const err = {};
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.category) err.category = "Category is required";
    if (!formData.expiryDate) err.expiryDate = "Expiry date is required";
    if (!formData.entryDate) err.entryDate = "Entry date is required";
    if (formData.price === "" || Number(formData.price) <= 0)
      err.price = "Enter valid price";
    if (formData.stock === "" || Number(formData.stock) < 0)
      err.stock = "Enter valid stock";
    return err;
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const supplierId = getUserIdFromToken();
    if (!supplierId) {
      alert("You must be logged in to save medicine.");
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append("name", formData.name);
      form.append("category", formData.category);
      form.append("price", formData.price);
      form.append("stock", formData.stock);
      form.append("minThreshold", formData.threshold);
      form.append("expiryDate", formData.expiryDate);
      form.append("entryDate", formData.entryDate);
      form.append("batchNumber", formData.batchNumber);
      form.append("description", formData.description);
      form.append("supplierId", supplierId);
      if (formData.image) form.append("image", formData.image);

      if (id) {
        await axios.put(`${API_URL}/medicines/${id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Medicine updated successfully ✅");
      } else {
        await axios.post(`${API_URL}/medicines`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Medicine added successfully ✅");
      }
      handleCancel();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "Error saving medicine");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      threshold: "",
      expiryDate: "",
      entryDate: "",
      batchNumber: "",
      description: "",
      image: null,
    });
    setErrors({});
    setPreview(null);
  };

  return (
    <>
      <div className="add-page-header">
        <h1 className="add-page-title">{id ? "Edit Medicine" : "Add Medicine"}</h1>
      </div>

      <div className="add-form-container">
        <form onSubmit={handleSubmit}>
          <div className="add-form-grid">

            <div>
              <label className="add-label">Name</label>
              <input
                type="text"
                name="name"
                className={`add-input ${errors.name ? "input-error" : ""}`}
                placeholder="Medicine Name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            <div>
              <label className="add-label">Category</label>
              <select
                name="category"
                className={`add-select ${errors.category ? "input-error" : ""}`}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && <p className="error-text">{errors.category}</p>}
            </div>

            <div>
              <label className="add-label">Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                className={`add-input ${errors.expiryDate ? "input-error" : ""}`}
                value={formData.expiryDate}
                onChange={handleChange}
              />
              {errors.expiryDate && <p className="error-text">{errors.expiryDate}</p>}
            </div>

            <div>
              <label className="add-label">Stock Entry Date</label>
              <input
                type="date"
                name="entryDate"
                className={`add-input ${errors.entryDate ? "input-error" : ""}`}
                value={formData.entryDate}
                onChange={handleChange}
              />
              {errors.entryDate && <p className="error-text">{errors.entryDate}</p>}
            </div>

            <div>
              <label className="add-label">Price</label>
              <input
                type="number"
                name="price"
                className={`add-input ${errors.price ? "input-error" : ""}`}
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <p className="error-text">{errors.price}</p>}
            </div>

            <div>
              <label className="add-label">Stock</label>
              <input
                type="number"
                name="stock"
                className={`add-input ${errors.stock ? "input-error" : ""}`}
                placeholder="Stock Quantity"
                value={formData.stock}
                onChange={handleChange}
              />
              {errors.stock && <p className="error-text">{errors.stock}</p>}
            </div>

            <div>
              <label className="add-label">Min Threshold</label>
              <input
                type="number"
                name="threshold"
                className="add-input"
                placeholder="Min Threshold"
                value={formData.threshold}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="add-label">Batch Number</label>
              <input
                type="text"
                name="batchNumber"
                className="add-input"
                placeholder="Batch Number"
                value={formData.batchNumber}
                onChange={handleChange}
              />
            </div>

            <div className="add-full-width">
              <label className="add-label">Description</label>
              <textarea
                name="description"
                className="add-textarea"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="add-full-width">
              <label className="add-label">Upload Image</label>
              <input type="file" name="image" className="add-input" onChange={handleChange} />
              {preview && <img src={preview} alt="Preview" className="image-preview" />}
            </div>

          </div>

          <div className="add-form-actions">
            <button type="button" onClick={handleCancel} className="add-btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="add-btn-save">
              {loading ? "Saving..." : id ? "Update Medicine" : "Save Medicine"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default AddMedicine;