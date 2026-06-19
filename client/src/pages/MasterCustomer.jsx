import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export default function MasterCustomer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [editId, setEditId] = useState(null);

  function fetchCustomers() {
    setLoading(true);
    api.get('/customers').then(function (res) {
      setCustomers(res.data);
      setLoading(false);
    }).catch(err => {
      toast.error('Failed to load customers');
      setLoading(false);
    });
  }

  useEffect(function () {
    fetchCustomers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !phone) return toast.error('Name and Phone are required');
    
    try {
      if (editId) {
        await api.put('/customers/' + editId, { name, phone, email, address });
        toast.success('Customer updated');
      } else {
        await api.post('/customers', { name, phone, email, address });
        toast.success('Customer added');
      }
      handleCancelEdit();
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving customer');
    }
  }

  function handleAdd() {
    setEditId(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsModalOpen(true);
  }

  function handleEdit(customer) {
    setEditId(customer._id);
    setName(customer.name);
    setPhone(customer.phone);
    setEmail(customer.email || '');
    setAddress(customer.address || '');
    setIsModalOpen(true);
  }

  function handleCancelEdit() {
    setEditId(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setIsModalOpen(false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete('/customers/' + id);
      toast.success('Deleted');
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting customer');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Master Customer</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Phone</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Email</th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan="4" className="text-center py-12 text-gray-400">Loading...</td></tr>
            )}
            {!loading && customers.length === 0 && (
              <tr><td colSpan="4" className="text-center py-12 text-gray-400">No customers found</td></tr>
            )}
            {customers.map(customer => (
              <tr key={customer._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-gray-900">{customer.name}</td>
                <td className="px-5 py-3.5 text-gray-600">{customer.phone}</td>
                <td className="px-5 py-3.5 text-gray-600">{customer.email || '-'}</td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(customer._id)}
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
              <h2 className="text-lg font-semibold text-gray-900">{editId ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    className="input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Customer Name"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    className="input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email Address (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Address (optional)"
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
