import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./addMedicine.css";
import { API_URL, IMAGE_URL } from "../../services/api";


const AddMedicine = () => {
  const { id } = useParams(); // ✅ get id for edit

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    threshold: "",
    expiry: "",
    addedDate: "", // ✅ NEW FIELD
    batch: "",
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeBtn, setActiveBtn] = useState(null);
  const [preview, setPreview] = useState(null);

  // =====================
  // FETCH MEDICINE (EDIT MODE)
  // =====================
  useEffect(() => {
    if (id) {
      fetchMedicine();
    }
  }, [id]);

  const fetchMedicine = async () => {
    try {
      const res = await axios.get(`${API_URL}/medicines/${id}`);
      const data = res.data;

      setFormData({
        name: data.name || "",
        sku: data.sku || "",
        category: data.category || "",
        price: data.price || "",
        stock: data.stock || "",
        threshold: data.minThreshold || "",
        expiry: data.expiryDate
          ? data.expiryDate.split("T")[0]
          : "",
        addedDate: data.addedDate   // ✅ NEW
          ? data.addedDate.split("T")[0]
          : "",
        batch: data.batchNumber || "",
        description: data.description || "",
        image: null,
      });

      if (data.image) {
        setPreview(`${IMAGE_URL}/uploads/${data.image}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load medicine");
    }
  };

  // =====================
  // VALIDATION
  // =====================
  const validateForm = (data) => {
    const err = {};

    if (!data.name.trim()) err.name = "Medicine name is required";
    if (!data.sku.trim()) err.sku = "SKU is required";
    if (!data.category) err.category = "Category is required";

    if (data.price === "" || Number(data.price) <= 0) {
      err.price = "Enter valid price";
    }

    if (data.stock === "" || Number(data.stock) < 0) {
      err.stock = "Enter valid stock quantity";
    }

    return err;
  };

  // =====================
  // HANDLE CHANGE
  // =====================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData({ ...formData, image: file });

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setFormData({ ...formData, [name]: value });

      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
    }
  };
  
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId;
    } catch (err) {
      console.error("Invalid token");
      return null;
    }
  };

  const supplierId = getUserIdFromToken();

  // =====================
  // SUBMIT (CREATE + UPDATE)
  // =====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setActiveBtn("save");

    const validationErrors = validateForm(formData);

    if (Object.values(validationErrors).some((e) => e)) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const form = new FormData();

      form.append("name", formData.name);
      form.append("sku", formData.sku);
      form.append("category", formData.category);
      form.append("price", formData.price);
      form.append("stock", formData.stock);
      form.append("minThreshold", formData.threshold);
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
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.post(`${API_URL}/medicines`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      console.log(res.data);

      alert(
        id
          ? "Medicine updated successfully ✅"
          : "Medicine added successfully ✅"
      );

      handleCancel();

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // RESET
  // =====================
  const handleCancel = () => {
    setActiveBtn("cancel");
    setFormData({
      name: "",
      sku: "",
      category: "",
      price: "",
      stock: "",
      threshold: "",
      expiry: "",
      addedDate: "", // ✅ NEW
      batch: "",
      description: "",
      image: null,
    });
    setErrors({});
    setPreview(null);
  };

  return (
    <>
      <div className="add-page-header">
        <h1 className="add-page-title">
          {id ? "Edit Medicine" : "Add Medicine"}
        </h1>
        <p className="add-page-subtitle">
          {id
            ? "Update medicine details"
            : "Add a new medicine to your inventory"}
        </p>
      </div>

      <div className="add-form-container">
        <form onSubmit={handleSubmit}>
          <div className="add-form-grid">

            {/* NAME */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Medicine Name"
                className={`add-input ${errors.name ? "input-error" : ""}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>

            {/* SKU */}
            <div>
              <input
                type="text"
                name="sku"
                placeholder="SKU"
                className={`add-input ${errors.sku ? "input-error" : ""}`}
                value={formData.sku}
                onChange={handleChange}
              />
              {errors.sku && <p className="error-text">{errors.sku}</p>}
            </div>

            {/* CATEGORY */}
            <div>
              <select
                name="category"
                className={`add-select ${errors.category ? "input-error" : ""}`}
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                <option value="baby-care">Baby Care</option>
                <option value="medicine">Medicine</option>
                <option value="beauty">Beauty</option>
                <option value="wellness">Wellness</option>
                <option value="health-devices">Health Devices</option>
                <option value="diabetes">Diabetes Care</option>
                <option value="heart-care">Heart Care</option>
                <option value="stomach-care">Stomach Care</option>
                <option value="liver-care">Liver Care</option>
                <option value="bone-joint-muscle-care">Bone & Joint Care</option>
                <option value="kidney-care">Kidney Care</option>
                <option value="derma-care">Derma Care</option>
                <option value="respiratory-care">Respiratory Care</option>
              </select>
              {errors.category && <p className="error-text">{errors.category}</p>}
            </div>

            {/* PRICE */}
            <div>
              <input
                type="number"
                name="price"
                placeholder="Price"
                className={`add-input ${errors.price ? "input-error" : ""}`}
                value={formData.price}
                onChange={handleChange}
              />
              {errors.price && <p className="error-text">{errors.price}</p>}
            </div>

            {/* STOCK */}
            <div>
              <input
                type="number"
                name="stock"
                placeholder="Stock Quantity"
                className={`add-input ${errors.stock ? "input-error" : ""}`}
                value={formData.stock}
                onChange={handleChange}
              />
              {errors.stock && <p className="error-text">{errors.stock}</p>}
            </div>

            {/* THRESHOLD */}
            <div>
              <input
                type="number"
                name="threshold"
                placeholder="Min Threshold"
                className="add-input"
                value={formData.threshold}
                onChange={handleChange}
              />
            </div>

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
            <div>
              <input
                type="text"
                name="batch"
                placeholder="Batch Number"
                className="add-input"
                value={formData.batch}
                onChange={handleChange}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="add-full-width">
              <textarea
                name="description"
                placeholder="Description"
                className="add-textarea"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* IMAGE */}
            <div className="add-full-width">
              <input
                type="file"
                name="image"
                className="add-input"
                onChange={handleChange}
              />
              {preview && <img src={preview} width="100" />}
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
              disabled={loading}
              className={`add-btn-save ${activeBtn === "save" ? "active-btn" : ""}`}
            >
              {loading
                ? "Saving..."
                : id
                  ? "Update Medicine"
                  : "Save Medicine"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddMedicine;