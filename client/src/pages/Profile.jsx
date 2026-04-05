import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchOrders } from "../services/orderService";
import {
  User,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Settings,
  MapPin,
  ChevronRight,
  Info,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const formatMoney = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [activeSection, setActiveSection] = useState("profile");

  const userName = user?.name || "Guest User";
  const firstLetter = userName.charAt(0).toUpperCase();

  const activityTitle = useMemo(() => {
    if (user?.role === "admin") {
      return "Recent Activity";
    }
    if (activeSection === "orders") {
      return "Order History";
    }
    if (activeSection === "addresses") {
      return "My Addresses";
    }
    return "Recent Activity";
  }, [activeSection, user?.role]);

  const recentOrders = useMemo(() => allOrders.slice(0, 2), [allOrders]);

  const uniqueAddresses = useMemo(() => {
    const addressByKey = new Map();

    allOrders.forEach((order) => {
      const rawAddress = String(order?.address || "").trim();
      if (!rawAddress) {
        return;
      }

      const cleanedAddress = rawAddress.replace(/\s+/g, " ");
      const key = cleanedAddress.toLowerCase();
      const orderDate = order?.placedAt || order?.createdAt || null;

      if (!addressByKey.has(key)) {
        addressByKey.set(key, {
          address: cleanedAddress,
          lastUsedAt: orderDate,
        });
        return;
      }

      const current = addressByKey.get(key);
      const currentTime = new Date(current?.lastUsedAt || 0).getTime();
      const nextTime = new Date(orderDate || 0).getTime();

      if (nextTime > currentTime) {
        addressByKey.set(key, {
          address: cleanedAddress,
          lastUsedAt: orderDate,
        });
      }
    });

    return Array.from(addressByKey.values()).sort((a, b) => {
      const aTime = new Date(a?.lastUsedAt || 0).getTime();
      const bTime = new Date(b?.lastUsedAt || 0).getTime();
      return bTime - aTime;
    });
  }, [allOrders]);

  useEffect(() => {
    if (!user || user.role === "admin") {
      return;
    }

    let active = true;

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError("");
      try {
        const items = await fetchOrders();
        if (active) {
          const sortedOrders = [...items].sort((a, b) => {
            const dateA = new Date(a?.placedAt || a?.createdAt || 0).getTime();
            const dateB = new Date(b?.placedAt || b?.createdAt || 0).getTime();
            return dateB - dateA;
          });
          setAllOrders(sortedOrders);
        }
      } catch (error) {
        if (active) {
          setOrdersError(error.response?.data?.message || "Unable to load order history");
        }
      } finally {
        if (active) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      active = false;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const scrollToActivity = (section) => {
    setActiveSection(section);
    const target = document.getElementById("order-history-block");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        target.focus();
      }, 350);
    }
  };

  if (!user) {
    return <div style={styles.loading}>Loading your wellness profile...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>{firstLetter}</div>
          <h2 style={styles.userName}>{userName}</h2>
          <span style={styles.roleTag}>{user?.role === "admin" ? "Pharmacist / Admin" : "Customer"}</span>
        </div>

        <div style={styles.navMenu}>
          <button
            type="button"
            onClick={() => setActiveSection("profile")}
            style={activeSection === "profile" ? styles.activeLinkButton : styles.navButton}
          >
            <User size={18} /> <span>My Profile</span> <ChevronRight size={16} />
          </button>

          {user?.role === "admin" && (
            <Link to="/dashboard" style={styles.adminLink}>
              <LayoutDashboard size={18} />
              <span>Admin Dashboard</span>
              <ChevronRight size={16} />
            </Link>
          )}

          <button
            type="button"
            onClick={() => scrollToActivity("orders")}
            style={activeSection === "orders" ? styles.navButtonActive : styles.navButton}
          >
            <ShoppingBag size={18} /> <span>Order History</span> <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => scrollToActivity("addresses")}
            style={activeSection === "addresses" ? styles.navButtonActive : styles.navButton}
          >
            <MapPin size={18} /> <span>My Addresses</span> <ChevronRight size={16} />
          </button>

          <Link to="/about" style={styles.navLink}>
            <Info size={18} /> <span>About Us</span> <ChevronRight size={16} />
          </Link>

          <Link to="/settings" style={styles.navLink}>
            <Settings size={18} /> <span>Account Settings</span> <ChevronRight size={16} />
          </Link>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <h3 style={styles.sectionHeading}>General Information</h3>
        <div style={styles.grid}>
          <div style={styles.infoBox}>
            <Mail size={20} color="#24aeb1" />
            <div>
              <p style={styles.label}>EMAIL</p>
              <p style={styles.value}>{user?.email}</p>
            </div>
          </div>
          <div style={styles.infoBox}>
            <ShieldCheck size={20} color="#24aeb1" />
            <div>
              <p style={styles.label}>ACCOUNT STATUS</p>
              <p style={styles.value}>Verified {user?.role?.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <h3 style={styles.sectionHeading} id="recent-activity" tabIndex={-1}>
          {activityTitle}
        </h3>

        {user?.role === "admin" ? (
          <div style={styles.emptyState}>
            <ShoppingBag size={48} color="#e0e0e0" />
            <p style={styles.emptyText}>Admin account active. Manage medicines via the dashboard.</p>
            <Link to="/dashboard" style={styles.shopBtn}>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div style={styles.ordersPanel} id="order-history-block" tabIndex={-1}>
            {ordersLoading ? <p style={styles.mutedText}>Loading orders...</p> : null}
            {ordersError ? <p style={styles.errorText}>{ordersError}</p> : null}

            {activeSection === "profile" && !ordersLoading && !ordersError && !recentOrders.length ? (
              <div style={styles.emptyState}>
                <ShoppingBag size={48} color="#e0e0e0" />
                <p style={styles.emptyText}>You haven't placed any orders yet.</p>
                <Link to="/" style={styles.shopBtn}>
                  Start Shopping
                </Link>
              </div>
            ) : null}

            {activeSection === "profile" && !ordersLoading && !ordersError && recentOrders.length ? (
              <div style={styles.orderList}>
                {recentOrders.map((order) => (
                  <article key={`recent-${order.id}`} style={styles.orderCard}>
                    <div style={styles.orderHead}>
                      <div>
                        <strong style={styles.orderId}>{order.orderNumber || order.id}</strong>
                        <p style={styles.orderTime}>{new Date(order.placedAt || order.createdAt).toLocaleString()}</p>
                      </div>
                      <span style={styles.statusPill}>{order.status}</span>
                    </div>
                    <div style={styles.orderMetaRow}>
                      <span>Items: {order.totalItems}</span>
                      <strong>{formatMoney(order.totalAmount)}</strong>
                    </div>
                    <p style={styles.orderMetaLine}>Payment: {order.paymentStatus}</p>
                    <p style={styles.orderMetaLine}>Pickup: {order.pickupSlot?.label || "N/A"}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {activeSection === "orders" && !ordersLoading && !ordersError && !allOrders.length ? (
              <div style={styles.emptyState}>
                <ShoppingBag size={48} color="#e0e0e0" />
                <p style={styles.emptyText}>No orders found in history.</p>
              </div>
            ) : null}

            {activeSection === "orders" && !ordersLoading && !ordersError && allOrders.length ? (
              <div style={styles.orderList}>
                {allOrders.map((order) => (
                  <article key={`history-${order.id}`} style={styles.orderCard}>
                    <div style={styles.orderHead}>
                      <div>
                        <strong style={styles.orderId}>{order.orderNumber || order.id}</strong>
                        <p style={styles.orderTime}>{new Date(order.placedAt || order.createdAt).toLocaleString()}</p>
                      </div>
                      <span style={styles.statusPill}>{order.status}</span>
                    </div>
                    <div style={styles.orderMetaRow}>
                      <span>Items: {order.totalItems}</span>
                      <strong>{formatMoney(order.totalAmount)}</strong>
                    </div>
                    <p style={styles.orderMetaLine}>Payment: {order.paymentStatus}</p>
                    <p style={styles.orderMetaLine}>Pickup: {order.pickupSlot?.label || "N/A"}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {activeSection === "addresses" && !ordersLoading && !ordersError && !uniqueAddresses.length ? (
              <div style={styles.emptyState}>
                <MapPin size={48} color="#e0e0e0" />
                <p style={styles.emptyText}>No saved addresses found from your orders yet.</p>
              </div>
            ) : null}

            {activeSection === "addresses" && !ordersLoading && !ordersError && uniqueAddresses.length ? (
              <div style={styles.addressList}>
                {uniqueAddresses.map((entry) => (
                  <article key={entry.address.toLowerCase()} style={styles.addressCard}>
                    <div style={styles.addressHeader}>
                      <MapPin size={16} color="#24aeb1" />
                      <strong style={styles.addressText}>{entry.address}</strong>
                    </div>
                    <p style={styles.orderMetaLine}>
                      Last used: {entry.lastUsedAt ? new Date(entry.lastUsedAt).toLocaleString() : "N/A"}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", maxWidth: "1100px", margin: "50px auto", gap: "25px", padding: "0 20px" },
  sidebar: {
    flex: "1",
    backgroundColor: "#242c44",
    borderRadius: "12px",
    padding: "30px 0",
    color: "#fff",
    height: "fit-content",
  },
  avatarSection: { textAlign: "center", padding: "0 20px 25px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  avatar: {
    width: "70px",
    height: "70px",
    backgroundColor: "#24aeb1",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 auto 15px",
  },
  userName: { fontSize: "18px", margin: "0 0 5px" },
  roleTag: {
    fontSize: "11px",
    backgroundColor: "rgba(36, 174, 177, 0.2)",
    padding: "3px 10px",
    borderRadius: "4px",
    color: "#24aeb1",
    fontWeight: "bold",
  },
  navMenu: { display: "flex", flexDirection: "column", marginTop: "15px" },
  activeLinkButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "15px 25px",
    width: "100%",
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "rgba(36, 174, 177, 0.2)",
    borderLeft: "4px solid #24aeb1",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
  },
  activeLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "15px 25px",
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "rgba(36, 174, 177, 0.2)",
    borderLeft: "4px solid #24aeb1",
    fontSize: "14px",
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "15px 25px",
    textDecoration: "none",
    color: "rgba(255,255,255,0.7)",
    fontSize: "14px",
    transition: "0.3s",
  },
  navButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "15px 25px",
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.7)",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    appearance: "none",
  },
  navButtonActive: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "15px 25px",
    background: "rgba(36, 174, 177, 0.2)",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    borderLeft: "4px solid #24aeb1",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    appearance: "none",
  },
  adminLink: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "15px 25px",
    textDecoration: "none",
    color: "#24aeb1",
    fontSize: "14px",
    fontWeight: "bold",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    transition: "0.3s",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 25px",
    marginTop: "20px",
    width: "100%",
    backgroundColor: "transparent",
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    color: "#ff6f61",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
    transition: "0.3s",
  },
  mainContent: {
    flex: "3",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "35px",
    boxShadow: "0 2px 20px rgba(0,0,0,0.05)",
  },
  sectionHeading: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#242c44",
    marginBottom: "20px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "40px" },
  infoBox: { display: "flex", alignItems: "center", gap: "15px", padding: "20px", border: "1px solid #f0f0f0", borderRadius: "8px" },
  label: { fontSize: "10px", color: "#a0a0a0", margin: 0, fontWeight: "700" },
  value: { fontSize: "14px", color: "#242c44", margin: 0, fontWeight: "600" },
  emptyState: { textAlign: "center", padding: "50px 0", border: "2px dashed #f0f0f0", borderRadius: "12px" },
  emptyText: { color: "#888", margin: "15px 0" },
  shopBtn: {
    display: "inline-block",
    backgroundColor: "#24aeb1",
    color: "#fff",
    padding: "10px 25px",
    borderRadius: "5px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "14px",
  },
  ordersPanel: { border: "2px dashed #f0f0f0", borderRadius: "12px", padding: "18px" },
  orderList: { display: "grid", gap: "12px" },
  orderCard: { border: "1px solid #eef2f5", borderRadius: "10px", padding: "12px" },
  addressList: { display: "grid", gap: "10px" },
  addressCard: { border: "1px solid #eef2f5", borderRadius: "10px", padding: "12px" },
  addressHeader: { display: "flex", alignItems: "center", gap: "8px", color: "#23344a" },
  addressText: { color: "#23344a", fontSize: "14px" },
  orderHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" },
  orderId: { color: "#23344a", fontSize: "14px" },
  orderTime: { margin: "3px 0 0", color: "#7b8794", fontSize: "12px" },
  statusPill: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#245578",
    background: "#e9f4fa",
    textTransform: "capitalize",
  },
  orderMetaRow: { display: "flex", justifyContent: "space-between", marginTop: "8px", color: "#334e68", fontSize: "13px" },
  orderMetaLine: { margin: "4px 0 0", color: "#627d98", fontSize: "12px" },
  mutedText: { color: "#7b8794", margin: 0 },
  errorText: { color: "#d14343", margin: "0 0 8px" },
  loading: { textAlign: "center", marginTop: "100px", color: "#242c44", fontWeight: "bold" },
};

export default Profile;
