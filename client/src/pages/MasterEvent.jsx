import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function MasterEvent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [showTerms, setShowTerms] = useState(true);
  const [termsAndConditions, setTermsAndConditions] = useState('');
  const [editId, setEditId] = useState(null);

  function fetchCategories() {
    setLoading(true);
    api.get('/event-categories').then(function (res) {
      setCategories(res.data);
      setLoading(false);
    }).catch(err => {
      toast.error('Failed to load event categories');
      setLoading(false);
    });
  }

  useEffect(function () {
    fetchCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) return toast.error('Name is required');
    
    try {
      if (editId) {
        await api.put('/event-categories/' + editId, { name, showTerms, termsAndConditions });
        toast.success('Event Category updated');
      } else {
        await api.post('/event-categories', { name, showTerms, termsAndConditions });
        toast.success('Event Category added');
      }
      handleCancelEdit();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving category');
    }
  }

  function handleAdd() {
    setEditId(null);
    setName('');
    setShowTerms(true);
    setTermsAndConditions('');
    setIsModalOpen(true);
  }

  function handleEdit(cat) {
    setEditId(cat._id);
    setName(cat.name);
    setShowTerms(cat.showTerms);
    setTermsAndConditions(cat.termsAndConditions || '');
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditId(null);
    setName('');
    setShowTerms(true);
    setTermsAndConditions('');
    setIsModalOpen(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this event category?')) return;
    try {
      await api.delete('/event-categories/' + id);
      toast.success('Deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting category');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Master Event</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Event Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Show Terms</th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan="3" className="text-center py-12 text-gray-400">Loading...</td></tr>
            )}
            {!loading && categories.length === 0 && (
              <tr><td colSpan="3" className="text-center py-12 text-gray-400">No event categories found</td></tr>
            )}
            {categories.map(cat => (
              <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">{cat.name}</td>
                <td className="px-5 py-3.5 text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cat.showTerms ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.showTerms ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Event Category' : 'Add Event Category'}</h2>
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Wedding"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showTerms"
                    checked={showTerms}
                    onChange={e => setShowTerms(e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="showTerms" className="text-sm text-gray-700">Show Terms & Conditions</label>
                </div>
                {showTerms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                    <textarea
                      className="input"
                      rows="4"
                      value={termsAndConditions}
                      onChange={e => setTermsAndConditions(e.target.value)}
                      placeholder="Terms..."
                    ></textarea>
                  </div>
                )}
                <div className="flex gap-3 pt-2 mt-2">
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    {editId ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
