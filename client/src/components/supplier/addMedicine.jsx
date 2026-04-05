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
<<<<<<< HEAD
    expiryDate: "",
    entryDate: "",
    batchNumber: "",
=======
    expiry: "",
    addedDate: "", // ✅ NEW FIELD
    batch: "",
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
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
<<<<<<< HEAD
        expiryDate: data.expiryDate?.split("T")[0] || "",
        entryDate: data.entryDate?.split("T")[0] || "",
        batchNumber: data.batchNumber || "",
=======
        expiry: data.expiryDate
          ? data.expiryDate.split("T")[0]
          : "",
        addedDate: data.addedDate   // ✅ NEW
          ? data.addedDate.split("T")[0]
          : "",
        batch: data.batchNumber || "",
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
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
<<<<<<< HEAD

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

=======
  
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
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
<<<<<<< HEAD
      form.append("expiryDate", formData.expiryDate);
      form.append("entryDate", formData.entryDate);
      form.append("batchNumber", formData.batchNumber);
      form.append("description", formData.description);
      form.append("supplierId", supplierId);
      if (formData.image) form.append("image", formData.image);

      if (id) {
        await axios.put(`${API_URL}/medicines/${id}`, form, {
=======
      form.append("expiryDate", formData.expiry);
      form.append("addedDate", formData.addedDate); // ✅ NEW
      form.append("batchNumber", formData.batch);
      form.append("description", formData.description);
      form.append("supplierId", supplierId);

      if (formData.image) {
        form.append("image", formData.image);
      }

      let res;

      if (id) {
        res = await axios.put(`${API_URL}/medicines/${id}`, form, {
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Medicine updated successfully ✅");
      } else {
<<<<<<< HEAD
        await axios.post(`${API_URL}/medicines`, form, {
=======
        res = await axios.post(`${API_URL}/medicines`, form, {
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
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
<<<<<<< HEAD
      expiryDate: "",
      entryDate: "",
      batchNumber: "",
=======
      expiry: "",
      addedDate: "", // ✅ NEW
      batch: "",
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
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

<<<<<<< HEAD
=======
{/* EXPIRY */}
<div>
  <label className="hint-label">Expiry Date</label>
  <input
    type="date"
    name="expiry"
    className="add-input"
    value={formData.expiry}
    onChange={handleChange}
  />
</div>

{/* ADDED DATE */}
<div>
  <label className="hint-label">Added Date</label>
  <input
    type="date"
    name="addedDate"
    className="add-input"
    value={formData.addedDate}
    onChange={handleChange}
  />
</div>

            {/* BATCH */}
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
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
<<<<<<< HEAD
            <button type="button" onClick={handleCancel} className="add-btn-cancel">Cancel</button>
            <button type="submit" disabled={loading} className="add-btn-save">
              {loading ? "Saving..." : id ? "Update Medicine" : "Save Medicine"}
=======
            <button
              type="button"
              onClick={handleCancel}
              className={`add-btn-cancel ${activeBtn === "cancel" ? "active-btn" : ""}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`add-btn-save ${activeBtn === "save" ? "active-btn" : ""}`}
            >
              {loading
                ? "Saving..."
                : id
                  ? "Update Medicine"
                  : "Save Medicine"}
>>>>>>> e26f7a23f3d3e4f8e57a124ff6e38c49ca92df09
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default AddMedicine;