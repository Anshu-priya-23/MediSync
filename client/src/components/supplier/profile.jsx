import React, { useState, useEffect } from "react";
import axios from "axios";
import "./profile.css";
import { API_URL } from "../../services/api";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const supplierId = "69d088c13f5ee218ae3ccc42";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/${supplierId}`);
        setFormData({
          ...formData,
          name: res.data.name,
          email: res.data.email,
        });
        setLoading(false);
      } catch (err) {
        //alert("Failed to load profile data.");
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.newPassword) payload.password = formData.newPassword;

      await axios.put(`${API_URL}/users/${supplierId}`, payload);

      alert("Settings updated successfully!"); // ✅ changed text
      setFormData({ ...formData, newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  if (loading) return <div className="loading">Loading Settings...</div>;

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Settings</h1> {/* ✅ changed */}
        <p className="dashboard-subtitle">
          Manage your supplier settings and details {/* ✅ changed */}
        </p>
      </div>

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="profile-grid">
            <div className="full-width">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className={errors.name ? "input-error" : ""}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="full-width">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                className={errors.email ? "input-error" : ""}
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </div>

          <hr className="divider" />

          <h3 className="password-title">Change Password</h3>
          {/* <p className="password-note">Leave blank if you don't want to change it</p> */}

          <div className="profile-grid">
            <div>
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                className={errors.newPassword ? "input-error" : ""}
                value={formData.newPassword}
                onChange={handleChange}
              />
              {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
            </div>

            <div>
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={errors.confirmPassword ? "input-error" : ""}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="profile-actions">
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Profile;