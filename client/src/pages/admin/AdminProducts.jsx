import { useEffect, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const EMPTY_FORM = {
    name: "", productCode: "", category: "kapok-pillow",
    price: "", size: "", weight: "", description: "", image: "",
};

const CATEGORIES_LIST = [
    "kapok-pillow", "recron-pillow", "kapok-mattresses",
    "travel-quilt-bed", "korai-pai-bed",
];

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/admin/products");
            if (res.data.success) setProducts(res.data.products);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            if (editId) {
                await api.put(`/admin/product/${editId}`, form);
                toast.success("Product updated ✅");
            } else {
                await api.post("/admin/product", form);
                toast.success("Product added ✅");
            }
            setForm(EMPTY_FORM);
            setEditId(null);
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Save failed";
            toast.error(msg);
        } finally { setSaving(false); }
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name, productCode: product.productCode,
            category: product.category, price: product.price,
            size: product.size || "", weight: product.weight || "",
            description: product.description || "", image: product.image || "",
        });
        setEditId(product._id);
        setShowForm(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this product?")) return;
        try {
            await api.delete(`/admin/product/${id}`);
            toast.success("Deleted");
            fetchProducts();
        } catch (err) { toast.error("Delete failed"); }
    };

    const inputClass = "border p-2.5 rounded-lg text-sm focus:outline-red-500 w-full";

    return (
        <AdminLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Products</h2>
                <button
                    onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                    + Add Product
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h3 className="font-bold text-lg mb-4">{editId ? "Edit Product" : "Add New Product"}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 mb-1 block">Product Name *</label>
                            <input className={inputClass} placeholder="e.g. Kapok Pillow 20x30" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>

                        <div><label className="text-xs text-gray-500 mb-1 block">Product Code *</label>
                            <input className={inputClass} placeholder="e.g. KP-2030" value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} /></div>

                        <div><label className="text-xs text-gray-500 mb-1 block">Category *</label>
                            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {CATEGORIES_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select></div>

                        <div><label className="text-xs text-gray-500 mb-1 block">Price (₹) *</label>
                            <input className={inputClass} type="number" placeholder="e.g. 450" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>

                        <div><label className="text-xs text-gray-500 mb-1 block">Size</label>
                            <input className={inputClass} placeholder="e.g. 20x30 inch" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} /></div>

                        <div><label className="text-xs text-gray-500 mb-1 block">Weight</label>
                            <input className={inputClass} placeholder="e.g. 500g" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></div>

                        <div className="md:col-span-2"><label className="text-xs text-gray-500 mb-1 block">Image URL</label>
                            <input className={inputClass} placeholder="https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} /></div>

                        <div className="md:col-span-2"><label className="text-xs text-gray-500 mb-1 block">Description</label>
                            <textarea className={inputClass} rows={3} placeholder="Product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    </div>

                    {/* Preview image */}
                    {form.image && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-1">Image Preview</p>
                            <img src={form.image} alt="preview" className="h-32 rounded-lg object-cover border" onError={(e) => e.target.style.display = "none"} />
                        </div>
                    )}

                    <div className="flex gap-3 mt-5">
                        <button onClick={handleSave} disabled={saving}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">
                            {saving ? "Saving..." : editId ? "Update Product" : "Save Product"}
                        </button>
                        <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); }}
                            className="border px-6 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Products Table */}
            {loading ? <Loader /> : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr className="text-left text-gray-500">
                                <th className="px-4 py-3">Image</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((p) => (
                                <tr key={p._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img src={p.image} alt={p.name} className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                                            onError={(e) => { e.target.src = ""; e.target.className = "w-14 h-14 rounded-lg bg-gray-200"; }} />
                                    </td>
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{p.productCode}</td>
                                    <td className="px-4 py-3 text-gray-500">{p.category}</td>
                                    <td className="px-4 py-3 font-semibold text-red-600">₹{p.price}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(p)}
                                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(p._id)}
                                                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No products yet. Add one above.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
