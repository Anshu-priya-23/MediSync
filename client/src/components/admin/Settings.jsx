import React, { useState } from "react";
import "./Settings.css";
import { FiUser, FiLock, FiBell, FiSliders, FiShield } from "react-icons/fi";

const Settings = () => {
const [activeTab, setActiveTab] = useState("profile");

  return (

    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-container">

        {/* LEFT MENU */}
        <div className="settings-menu">
          <div
            className={`menu-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FiUser /> Admin Profile
          </div>

          <div
            className={`menu-item ${activeTab === "password" ? "active" : ""}`}
            onClick={() => setActiveTab("password")}
          >
            <FiLock /> Change Password
          </div>

          <div
            className={`menu-item ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <FiBell /> Notification Settings
          </div>

          <div
            className={`menu-item ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <FiSliders /> System Preferences
          </div>

          <div
            className={`menu-item ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            <FiShield /> Role & Permissions
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="settings-content">

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="settings-card">
              <h3>Admin Profile</h3>

              <div className="form-row">
                <div>
                  <label>Full Name</label>
                  <input defaultValue="System Admin" />
                </div>

                <div>
                  <label>Email</label>
                  <input defaultValue="admin@medisync.com" />
                </div>
              </div>

              <button className="primary-btn">Save Changes</button>
            </div>
          )}

          {/* PASSWORD */}
          {activeTab === "password" && (
            <div className="settings-card">
              <h3>Change Password</h3>

              <label>Current Password</label>
              <input type="password" />

              <label>New Password</label>
              <input type="password" />

              <label>Confirm Password</label>
              <input type="password" />

              <button className="primary-btn">Update Password</button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="settings-card">
              <h3>Notification Settings</h3>

              <div className="checkbox-row">
                <span>Low stock alerts</span>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="checkbox-row">
                <span>New supplier registration</span>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="checkbox-row">
                <span>Expiry date warnings</span>
                <input type="checkbox" defaultChecked />
              </div>

              <div className="checkbox-row">
                <span>Order updates</span>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          )}

          {/* SYSTEM PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="settings-card">
              <h3>System Preferences</h3>

              <label>Default Low Stock Threshold</label>
              <input defaultValue="100" />

              <label>Expiry Warning Days</label>
              <input defaultValue="90" />

              <button className="primary-btn">Save Preferences</button>
            </div>
          )}

          {/* ROLES */}
          {activeTab === "roles" && (
            <div className="settings-card">
              <h3>Role & Permission Settings</h3>

              <div className="role-box">
                <strong>Admin</strong>
                <p>Full access to all system features</p>
              </div>

              <div className="role-box">
                <strong>Supplier</strong>
                <p>Manage own medicines, view orders and performance</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;