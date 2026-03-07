import React, { useState } from "react";
import "./profile.css";

const Profile = () => {
  const [formData, setFormData] = useState({
    supplierName: "PharmaCorp Ltd",
    companyName: "PharmaCorp Ltd",
    email: "contact@pharmacorp.com",
    phone: "+1-555-0101",
    address: "123 Med Street, New York, NY 10001",
    gst: "GST1234567",
    license: "LIC-PC-001",
    bank: "XXXX-XXXX-XXXX-1234",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Profile Updated:", formData);
  };

  return (
    <>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Profile</h1>
        <p className="dashboard-subtitle">
          Manage your supplier profile and details
        </p>
      </div>

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          <div className="profile-grid">

            <div>
              <label>Supplier Name</label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="full-width">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>GST Number</label>
              <input
                type="text"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>License Number</label>
              <input
                type="text"
                name="license"
                value={formData.license}
                onChange={handleChange}
              />
            </div>

            <div className="full-width">
              <label>Bank Details</label>
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleChange}
              />
            </div>

          </div>

          <hr className="divider" />

          <h3 className="password-title">Change Password</h3>

          <div className="profile-grid">

            <div className="full-width">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
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