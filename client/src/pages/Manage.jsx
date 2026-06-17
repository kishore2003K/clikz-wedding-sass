import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const emptyCategory = { name: '', showTerms: true, termsAndConditions: '' };
const emptyService = { name: '', descriptions: '', eventCategory: '' };

export default function Manage() {
  const [tab, setTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSvcForm, setShowSvcForm] = useState(false);
  const [catForm, setCatForm] = useState(emptyCategory);
  const [svcForm, setSvcForm] = useState(emptyService);
  const [loading, setLoading] = useState(false);

  function fetchCategories() {
    return api.get('/event-categories').then(res => setCategories(res.data));
  }

  function fetchServices() {
    return api.get('/services').then(res => setServices(res.data));
  }

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  async function handleAddCategory(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/event-categories', catForm);
      toast.success('Event category added');
      setCatForm(emptyCategory);
      setShowCatForm(false);
      await fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding category');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteCategory(id) {
    if (!window.confirm('Delete this event category?')) return;
    try {
      await api.delete('/event-categories/' + id);
      toast.success('Category deleted');
      fetchCategories();
      fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting category');
    }
  }

  async function handleAddService(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const descriptionsArray = svcForm.descriptions.split(',').map(d => d.trim()).filter(Boolean);
      await api.post('/services', {
        name: svcForm.name,
        descriptions: descriptionsArray,
        eventCategory: svcForm.eventCategory,
      });
      toast.success('Service added');
      setSvcForm(emptyService);
      setShowSvcForm(false);
      await fetchServices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding service');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteService(id) {
    if (!id) {
      toast.error('Cannot delete this service');
      return;
    }
    if (!window.confirm('Delete this service?')) return;
    try {
      await api.delete('/services/' + id);
      toast.success('Service deleted');
      setServices(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting service');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage</h1>
          <p className="text-sm text-gray-500 mt-0.5">Event categories, services & bill terms</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab('categories')}
          className={tab === 'categories' ? 'btn-primary' : 'btn-secondary'}
        >
          Event Categories
        </button>
        <button
          type="button"
          onClick={() => setTab('services')}
          className={tab === 'services' ? 'btn-primary' : 'btn-secondary'}
        >
          Services
        </button>
      </div>

      {tab === 'categories' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowCatForm(true)} className="btn-primary">+ Add Category</button>
          </div>

          {showCatForm && (
            <div className="card p-5 mb-6">
              <h2 className="font-medium text-gray-900 mb-4">New Event Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Category Name *</label>
                    <input
                      className="input"
                      value={catForm.name}
                      onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Marriage, Birthday, Photo Products"
                      required
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catForm.showTerms}
                        onChange={e => setCatForm(f => ({ ...f, showTerms: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      Show terms &amp; conditions on bill
                    </label>
                  </div>
                </div>
                {catForm.showTerms && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Terms &amp; Conditions</label>
                    <textarea
                      className="input resize-none"
                      rows={6}
                      value={catForm.termsAndConditions}
                      onChange={e => setCatForm(f => ({ ...f, termsAndConditions: e.target.value }))}
                      placeholder="Enter terms shown on print / share bill..."
                    />
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Add Category'}</button>
                  <button type="button" onClick={() => setShowCatForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Terms on Bill</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Terms Preview</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${c.showTerms ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.showTerms ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs max-w-md truncate">
                      {c.showTerms ? (c.termsAndConditions || '—') : 'Not applicable (e.g. photo frame, phone case)'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleDeleteCategory(c._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-12 text-gray-400">No categories yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'services' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowSvcForm(true)} className="btn-primary" disabled={categories.length === 0}>
              + Add Service
            </button>
          </div>

          {categories.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4 text-sm">
              Add an event category first, then link services to it.
            </div>
          )}

          {showSvcForm && (
            <div className="card p-5 mb-6">
              <h2 className="font-medium text-gray-900 mb-4">New Service</h2>
              <form onSubmit={handleAddService} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Event Category *</label>
                  <select
                    className="input"
                    value={svcForm.eventCategory}
                    onChange={e => setSvcForm(f => ({ ...f, eventCategory: e.target.value }))}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Service Name *</label>
                  <input
                    className="input"
                    value={svcForm.name}
                    onChange={e => setSvcForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Drone Shoot, Photo Frame"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Descriptions (comma separated)</label>
                  <input
                    className="input"
                    value={svcForm.descriptions}
                    onChange={e => setSvcForm(f => ({ ...f, descriptions: e.target.value }))}
                    placeholder="e.g. Half Day, Full Day, With Photo"
                  />
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Add Service'}</button>
                  <button type="button" onClick={() => setShowSvcForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Service Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Descriptions</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-gray-600">{s.eventCategory?.name || '—'}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-3.5 text-gray-600">{s.descriptions?.join(', ') || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => handleDeleteService(s._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
                {services.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-12 text-gray-400">No services yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
