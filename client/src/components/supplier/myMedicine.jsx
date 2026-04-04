import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Pencil, Trash2, Package, Plus, X } from "lucide-react";
import "./myMedicine.css";
import { API_URL } from "../../services/api";


const MyMedicine = () => {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  // =====================
  // FETCH MEDICINES
  // =====================
  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/medicines`);
      setMedicines(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;

    try {
      await axios.delete(`${API_URL}/medicines/${id}`);
      setMedicines((prev) => prev.filter((med) => med._id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };


  return (
    <>
      <div className="dashboard-header medicine-header">
        <div>
          <h1 className="dashboard-title">My Medicines</h1>
          <p className="dashboard-subtitle">
            View and manage your listed medicines
          </p>
        </div>

        <button
          className="add-medicine-btn"
          onClick={() => navigate("/supplier-dashboard/add-medicine/")}
        >
          <Plus size={16} />
          Add Medicine
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="medicine-table">
        <div className="table-header">
          <span>Name</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : medicines.length === 0 ? (
          <p>No medicines found</p>
        ) : (
          medicines.map((med) => (
            <div key={med._id} className="table-row">
              <span>{med.name}</span>
              <span>{med.category}</span>
              <span>₹{med.price}</span>

              <span
                style={{
                  color: med.stock === 0 ? "red" : "inherit",
                  fontWeight: med.stock === 0 ? "bold" : "normal",
                }}
              >
                {med.stock}
              </span>

              <span className="table-actions">
                {/* EDIT */}
                <Pencil
                  size={18}
                  className="action-icon"
                  onClick={() =>
                    navigate(`/supplier-dashboard/add-medicine/${med._id}`)
                  }
                />

                {/* DELETE */}
                <Trash2
                  size={18}
                  className="action-icon delete-icon"
                  onClick={() => handleDelete(med._id)}
                />
              </span>
            </div>
          ))
        )}
      </div>

    </>
  );
};

export default MyMedicine;