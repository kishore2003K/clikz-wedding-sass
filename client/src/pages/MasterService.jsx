import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function MasterService() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [eventCategory, setEventCategory] = useState('');
  const [descriptionsStr, setDescriptionsStr] = useState('');
  const [editId, setEditId] = useState(null);

  function fetchData() {
    setLoading(true);
    Promise.all([
      api.get('/services'),
      api.get('/event-categories')
    ]).then(function ([servicesRes, categoriesRes]) {
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    }).catch(err => {
      toast.error('Failed to load data');
      setLoading(false);
    });
  }

  useEffect(function () {
    fetchData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name) return toast.error('Name is required');
    
    const descriptions = descriptionsStr
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload = {
      name,
      eventCategory: eventCategory || null,
      descriptions
    };
    
    try {
      if (editId) {
        await api.put('/services/' + editId, payload);
        toast.success('Service updated');
      } else {
        await api.post('/services', payload);
        toast.success('Service added');
      }
      handleCancelEdit();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving service');
    }
  }

  function handleAdd() {
    setEditId(null);
    setName('');
    setEventCategory('');
    setDescriptionsStr('');
    setIsModalOpen(true);
  }

  function handleEdit(srv) {
    setEditId(srv._id);
    setName(srv.name);
    setEventCategory(srv.eventCategory?._id || '');
    setDescriptionsStr((srv.descriptions || []).join('\n'));
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditId(null);
    setName('');
    setEventCategory('');
    setDescriptionsStr('');
    setIsModalOpen(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this service?')) return;
    try {
      await api.delete('/services/' + id);
      toast.success('Deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting service');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Master Service</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Service
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Event</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Descriptions</th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan="4" className="text-center py-12 text-gray-400">Loading...</td></tr>
            )}
            {!loading && services.length === 0 && (
              <tr><td colSpan="4" className="text-center py-12 text-gray-400">No services found</td></tr>
            )}
            {services.map(srv => (
              <tr key={srv._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">{srv.name}</td>
                <td className="px-5 py-3.5 text-gray-600">
                  {srv.eventCategory?.name ? (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                      {srv.eventCategory.name}
                    </span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3.5 text-gray-600">
                  {srv.descriptions && srv.descriptions.length > 0 
                    ? <ul className="list-disc list-inside space-y-1">{srv.descriptions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                    : '—'}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(srv)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(srv._id)}
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
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Service' : 'Add Service'}</h2>
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
                    placeholder="e.g. Photography"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Category</label>
                  <select
                    className="input"
                    value={eventCategory}
                    onChange={e => setEventCategory(e.target.value)}
                  >
                    <option value="">-- Select Event --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descriptions (One per line)</label>
                  <textarea
                    className="input"
                    rows="4"
                    value={descriptionsStr}
                    onChange={e => setDescriptionsStr(e.target.value)}
                    placeholder="E.g. Traditional Coverage&#10;Candid Coverage"
                  ></textarea>
                </div>

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
