import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 20;

    const fetchUsers = async (p = 1) => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users?page=${p}&limit=${LIMIT}`);
            if (res.data.success) {
                setUsers(res.data.users);
                setTotalPages(res.data.totalPages || 1);
                setTotal(res.data.total || res.data.users.length);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(1); }, []);

    const goToPage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
        fetchUsers(p);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm border">
                    Total: <span className="font-bold text-gray-800">{total}</span>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b">
                                <tr className="text-left text-gray-500">
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {user.isAdmin ? "Admin" : "Customer"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {user.isVerified ? "Verified" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-400">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1}
                        className="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                    >
                        ← Prev
                    </button>
                    <span className="text-sm text-gray-600">{page} / {totalPages}</span>
                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages}
                        className="px-4 py-1.5 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
                    >
                        Next →
                    </button>
                </div>
            )}
        </AdminLayout>
    );
}
