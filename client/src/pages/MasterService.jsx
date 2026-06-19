import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

export default function MasterService() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
    
    // Split descriptions by newline and remove empty lines
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

  function handleEdit(srv) {
    setEditId(srv._id);
    setName(srv.name);
    setEventCategory(srv.eventCategory?._id || '');
    setDescriptionsStr((srv.descriptions || []).join('\n'));
  }

  function handleCancelEdit() {
    setEditId(null);
    setName('');
    setEventCategory('');
    setDescriptionsStr('');
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="card p-5">
            <h2 className="text-lg font-medium mb-4">{editId ? 'Edit Service' : 'Add Service'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Photography"
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

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  {editId ? 'Update' : 'Save'}
                </button>
                {editId && (
                  <button type="button" onClick={handleCancelEdit} className="btn-secondary flex-1">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Event</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Descriptions</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
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
                    <td className="px-5 py-3.5 text-gray-600">{srv.eventCategory?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {srv.descriptions && srv.descriptions.length > 0 
                        ? srv.descriptions.map((d, i) => <div key={i}>• {d}</div>)
                        : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleEdit(srv)}
                          className="text-blue-500 hover:underline text-xs"
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(srv._id)}
                          className="text-red-400 hover:underline text-xs"
                        >Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
