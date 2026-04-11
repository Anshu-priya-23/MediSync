import React, { useState, useEffect } from "react";
import "./Settings.css";
import { FiUser, FiLock, FiSliders } from "react-icons/fi";
import axios from "axios";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    email: ""
  });

  // ✅ ONLY expiryDays now
  const [preferences, setPreferences] = useState({
    expiryDays: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // ✅ FETCH SETTINGS
  useEffect(() => {
    axios.get("http://localhost:5005/api/analytics/settings")
      .then((res) => {
        setProfile(res.data?.profile || { name: "", email: "" });

        setPreferences({
          expiryDays: res.data?.preferences?.expiryDays || ""
        });
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ SAVE PROFILE
  const saveProfile = () => {
    axios.put("http://localhost:5005/api/analytics/settings/profile", profile)
      .then(() => alert("Profile updated"))
      .catch(err => console.error(err));
  };

  // ✅ SAVE ONLY expiryDays
  const savePreferences = () => {
    axios.put(
      "http://localhost:5005/api/analytics/settings/preferences",
      { expiryDays: preferences.expiryDays }
    )
      .then(() => alert("Preferences updated"))
      .catch(err => console.error(err));
  };

  // ✅ PASSWORD
  const updatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return alert("All fields required");
    }

    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await axios.put(
        "http://localhost:5005/api/analytics/settings/password",
        { currentPassword, newPassword }
      );

      alert(res.data.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

    } catch (err) {
      alert(err.response?.data?.message || "Error updating password");
    }
  };

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
            className={`menu-item ${activeTab === "preferences" ? "active" : ""}`}
            onClick={() => setActiveTab("preferences")}
          >
            <FiSliders /> Expiry Settings
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
                  <input
                    value={profile?.name || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label>Email</label>
                  <input
                    value={profile?.email || ""}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <button onClick={saveProfile} className="primary-btn">
                Save Changes
              </button>
            </div>
          )}

          {/* PASSWORD */}
          {activeTab === "password" && (
            <div className="settings-card">
              <h3>Change Password</h3>

              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
              />

              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
              />

              <label>Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
              />

              <button onClick={updatePassword} className="primary-btn">
                Update Password
              </button>
            </div>
          )}

          {/* ONLY EXPIRY */}
          {activeTab === "preferences" && (
            <div className="settings-card">
              <h3>Expiry Settings</h3>

              <label>Expiry Warning Days</label>
              <input
                value={preferences?.expiryDays || ""}
                onChange={(e) =>
                  setPreferences({ expiryDays: e.target.value })
                }
              />

              <button onClick={savePreferences} className="primary-btn">
                Save Preferences
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;