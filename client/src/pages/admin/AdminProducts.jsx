import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import AdminLayout from "./AdminLayout";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

const EMPTY_FORM = {
    name: "", productCode: "", category: "kapok-pillow",
    price: "", size: "", weight: "", description: "", image: "", images: [""],
    variants: [], // [{label, size, weight, price}]
};

const CATEGORIES_LIST = [
    "kapok-pillow", "recron-pillow", "kapok-mattresses",
    "travel-quilt-bed", "korai-pai-bed",
];

/* ─── tiny reusable image upload tab ─── */
function ImagePanel({ form, setForm }) {
    const [tab, setTab] = useState("upload"); // "upload" | "url"
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef();

    const doUpload = async (files) => {
        if (!files || files.length === 0) return;
        const formData = new FormData();
        Array.from(files).forEach((f) => formData.append("images", f));
        setUploading(true);
        try {
            const res = await api.post("/admin/upload-image", formData);
            if (res.data.success) {
                const newUrls = res.data.urls;
                const cleaned = (form.images || []).filter((u) => u.trim() !== "");
                setForm({ ...form, images: [...cleaned, ...newUrls] });
                toast.success(`${newUrls.length} image(s) uploaded ✅`);
            } else {
                toast.error(res.data.message || "Upload failed");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        doUpload(e.dataTransfer.files);
    };

    return (
        <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-2 block">Product Images *</label>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-3 border rounded-lg p-1 w-fit bg-gray-50">
                <button
                    type="button"
                    onClick={() => setTab("upload")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${tab === "upload" ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    ☁ Upload to Cloudinary
                </button>
                <button
                    type="button"
                    onClick={() => setTab("url")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${tab === "url" ? "bg-white shadow text-red-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                    🔗 Paste URL
                </button>
            </div>

            {/* Upload tab */}
            {tab === "upload" && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                        ${dragOver ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-red-300 hover:bg-red-50/30"}`}
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        className="hidden"
                        onChange={(e) => doUpload(e.target.files)}
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <svg className="animate-spin h-7 w-7 text-red-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <p className="text-sm text-red-500 font-semibold">Uploading to Cloudinary…</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-3xl mb-2">☁️</div>
                            <p className="text-sm font-semibold text-gray-700">Drag & drop images here</p>
                            <p className="text-xs text-gray-400 mt-1">or click to browse · JPEG, PNG, WebP · max 5 MB each · up to 5 files</p>
                        </>
                    )}
                </div>
            )}

            {/* URL tab */}
            {tab === "url" && (
                <div className="space-y-2">
                    {(form.images || []).map((imgUrl, index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                className="border p-2.5 rounded-lg text-sm focus:outline-red-500 w-full"
                                placeholder="https://res.cloudinary.com/..."
                                value={imgUrl}
                                onChange={(e) => {
                                    const newImages = [...(form.images || [])];
                                    newImages[index] = e.target.value;
                                    setForm({ ...form, images: newImages });
                                }}
                            />
                            {(form.images || []).length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newImages = form.images.filter((_, i) => i !== index);
                                        setForm({ ...form, images: newImages });
                                    }}
                                    className="bg-red-50 text-red-600 hover:bg-red-100 px-3 rounded-lg font-bold transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setForm({ ...form, images: [...(form.images || []), ""] })}
                        className="text-xs text-blue-600 font-semibold mt-1 hover:underline"
                    >
                        + Add URL
                    </button>
                </div>
            )}

            {/* Previews (always shown) */}
            {form.images && form.images.some((img) => img.trim() !== "") && (
                <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Previews ({form.images.filter((i) => i.trim() !== "").length} image{form.images.filter((i) => i.trim() !== "").length !== 1 ? "s" : ""})</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {form.images.filter((img) => img.trim() !== "").map((img, idx) => (
                            <div key={idx} className="relative group flex-shrink-0">
                                <img
                                    src={img}
                                    alt={`preview-${idx}`}
                                    className="h-24 w-24 rounded-lg object-cover border"
                                    onError={(e) => { e.target.style.display = "none"; }}
                                />
                                {idx === 0 && (
                                    <span className="absolute bottom-1 left-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">MAIN</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const clean = form.images.filter((i) => i.trim() !== "");
                                        clean.splice(idx, 1);
                                        setForm({ ...form, images: clean.length ? clean : [""] });
                                    }}
                                    className="absolute top-1 right-1 bg-white/80 text-red-600 hover:bg-red-50 rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">First image is used as the primary image.</p>
                </div>
            )}
        </div>
    );
}

/* ─── main component ─── */
export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

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
            const payload = { ...form };
            payload.images = (payload.images || []).filter((url) => url.trim() !== "");
            payload.image = payload.images[0] || "";
            // Clean and validate variants
            payload.variants = (payload.variants || []).filter(v => v.label.trim() && v.price);
            // If no variants, price field is required
            if (payload.variants.length === 0 && !payload.price) {
                toast.error("Enter a price or add at least one variant");
                setSaving(false);
                return;
            }

            if (editId) {
                await api.put(`/admin/product/${editId}`, payload);
                toast.success("Product updated ✅");
            } else {
                await api.post("/admin/product", payload);
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
            images: product.images?.length ? product.images : (product.image ? [product.image] : [""]),
            variants: product.variants?.length ? product.variants.map(v => ({ ...v })) : [],
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

    // client-side search filter
    const filtered = products.filter((p) => {
        const q = search.toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.productCode.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });

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
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Product Name *</label>
                            <input className={inputClass} placeholder="e.g. Kapok Pillow 20x30" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Product Code *</label>
                            <input className={inputClass} placeholder="e.g. KP-2030" value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Category *</label>
                            <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                {CATEGORIES_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Price — only required when no variants */}
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">
                                Price (₹) {form.variants?.length > 0 ? <span className="text-gray-300">(set per variant below)</span> : "*"}
                            </label>
                            <input
                                className={inputClass}
                                type="number"
                                placeholder="e.g. 450"
                                value={form.price}
                                disabled={form.variants?.length > 0}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Size</label>
                            <input className={inputClass} placeholder="e.g. 20x30 inch" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Weight</label>
                            <input className={inputClass} placeholder="e.g. 500g" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
                        </div>

                        {/* Cloudinary Image Panel */}
                        <ImagePanel form={form} setForm={setForm} />

                        {/* ── Variants Section ── */}
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Variants (optional — for multi-size products)</label>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, variants: [...(form.variants || []), { label: "", size: "", weight: "", price: "" }] })}
                                    className="text-xs text-red-600 font-semibold hover:underline"
                                >
                                    + Add Variant
                                </button>
                            </div>

                            {(form.variants || []).length === 0 && (
                                <p className="text-xs text-gray-400 italic">No variants — product has a single price. Add variants for Small / Medium / Large etc.</p>
                            )}

                            {(form.variants || []).map((v, i) => (
                                <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-center">
                                    <input
                                        className="border p-2 rounded-lg text-sm focus:outline-red-500"
                                        placeholder="Label (e.g. Small)"
                                        value={v.label}
                                        onChange={(e) => {
                                            const updated = [...form.variants];
                                            updated[i] = { ...updated[i], label: e.target.value };
                                            setForm({ ...form, variants: updated });
                                        }}
                                    />
                                    <input
                                        className="border p-2 rounded-lg text-sm focus:outline-red-500"
                                        placeholder="Size (e.g. 16x24)"
                                        value={v.size}
                                        onChange={(e) => {
                                            const updated = [...form.variants];
                                            updated[i] = { ...updated[i], size: e.target.value };
                                            setForm({ ...form, variants: updated });
                                        }}
                                    />
                                    <input
                                        className="border p-2 rounded-lg text-sm focus:outline-red-500"
                                        placeholder="Weight (e.g. 500g)"
                                        value={v.weight}
                                        onChange={(e) => {
                                            const updated = [...form.variants];
                                            updated[i] = { ...updated[i], weight: e.target.value };
                                            setForm({ ...form, variants: updated });
                                        }}
                                    />
                                    <input
                                        className="border p-2 rounded-lg text-sm focus:outline-red-500"
                                        type="number"
                                        placeholder="Price (₹)"
                                        value={v.price}
                                        onChange={(e) => {
                                            const updated = [...form.variants];
                                            updated[i] = { ...updated[i], price: e.target.value };
                                            setForm({ ...form, variants: updated });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = form.variants.filter((_, idx) => idx !== i);
                                            setForm({ ...form, variants: updated });
                                        }}
                                        className="bg-red-50 text-red-600 hover:bg-red-100 px-2 py-2 rounded-lg font-bold text-sm transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            {(form.variants || []).length > 0 && (
                                <p className="text-[10px] text-gray-400 mt-1">Label · Size · Weight · Price — first variant price is used as the base price.</p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="text-xs text-gray-500 mb-1 block">Description</label>
                            <textarea className={inputClass} rows={3} placeholder="Product description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                        </div>
                    </div>

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

            {/* Search bar */}
            <div className="mb-4">
                <input
                    type="search"
                    placeholder="🔍 Search by name, code or category…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-80 border rounded-lg px-4 py-2 text-sm focus:outline-red-500"
                />
            </div>

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
                            {filtered.map((p) => (
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
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">
                                    {search ? `No products match "${search}".` : "No products yet. Add one above."}
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                    <p className="text-xs text-gray-400 px-4 py-2 border-t">
                        Showing {filtered.length} of {products.length} product{products.length !== 1 ? "s" : ""}
                    </p>
                </div>
            )}
        </AdminLayout>
    );
}
