import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || user?.role !== "admin") return;

      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get("http://127.0.0.1:5000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setMessage("⛔ Access denied: Admins only.");
        } else if (err.response?.status === 401) {
          setMessage("❌ Unauthorized: Invalid or expired token.");
        } else {
          setMessage("❌ Failed to fetch users.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== "admin") {
    return (
      <div className="p-6 min-h-screen text-red-600">
        ❌ You do not have access to this page.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      <h1 className="text-3xl font-bold mb-6">Admin User Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : message ? (
        <p className="text-red-500">{message}</p>
      ) : (
        <table className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded">
          <thead className="bg-gray-200 dark:bg-gray-700 text-left">
            <tr>
              <th className="border p-2 dark:border-gray-600">Username</th>
              <th className="border p-2 dark:border-gray-600">Role</th>
              <th className="border p-2 dark:border-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.user_id} className="border-t dark:border-gray-700">
                  <td className="border p-2 dark:border-gray-700">{user.username}</td>
                  <td className="border p-2 dark:border-gray-700">{user.role}</td>
                  <td className="border p-2 dark:border-gray-700">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center p-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
