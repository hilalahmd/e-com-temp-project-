import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2, Star, Loader, PackageSearch } from 'lucide-react';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ConfirmDialog from './ConfirmDialog';
import Pagination from './Pagination';

export default function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?page=${page}&limit=10&search=${search}`);
      setProducts(res.data.products || []);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await api.delete(`/products/${deleteConfirm}`);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full border-4 border-black p-3 pl-12 font-bold focus:outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-6 py-3 font-black uppercase tracking-widest flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-4 border-black text-sm uppercase font-black tracking-widest">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center"><Loader className="animate-spin mx-auto" size={32} /></td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-12 text-center text-gray-500">
                  <PackageSearch size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-bold uppercase tracking-widest">No products found</p>
                </td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p._id} className="border-b-2 border-gray-200 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 border-2 border-black bg-white flex-shrink-0">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{p.name}</div>
                        {p.isBestSeller && <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 uppercase mt-1"><Star size={12} className="fill-yellow-600" /> Best Seller</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-600">{p.category}</td>
                  <td className="p-4 font-black">${p.price.toFixed(2)}</td>
                  <td className="p-4 font-bold">{p.stock}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-black uppercase tracking-wider border-2 border-black ${p.isActive !== false ? 'bg-green-300' : 'bg-gray-300'}`}>
                      {p.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setEditProduct(p)} className="p-2 border-2 border-black hover:bg-blue-100 transition-colors" title="Edit"><Edit2 size={16} /></button>
                      <button onClick={() => setDeleteConfirm(p._id)} className="p-2 border-2 border-black hover:bg-red-100 text-red-600 transition-colors" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && <Pagination page={page} pages={pages} onPageChange={setPage} />}

      {showAddModal && <AddProductModal onClose={() => setShowAddModal(false)} onProductAdded={() => { setShowAddModal(false); fetchProducts(); }} />}
      {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onProductUpdated={() => { setEditProduct(null); fetchProducts(); }} />}
      {deleteConfirm && (
        <ConfirmDialog 
          title="Delete Product" 
          message="Are you sure you want to delete this product? This action cannot be undone." 
          onConfirm={handleDelete} 
          onCancel={() => setDeleteConfirm(null)} 
        />
      )}
    </div>
  );
}
