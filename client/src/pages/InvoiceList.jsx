import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  partial: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
};

function fmt(n) { return '₹' + Number(n || 0).toLocaleString('en-IN'); }

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  function fetchInvoices() {
    setLoading(true);
    api.get('/invoices', { params: { search, status } }).then(function (res) {
      setInvoices(res.data.invoices);
      setLoading(false);
    });
  }

  useEffect(function () {
    const t = setTimeout(fetchInvoices, 300);
    return function () { clearTimeout(t); };
  }, [search, status]);

  async function deleteInvoice(id) {
    if (!confirm('Delete this invoice?')) return;
    await api.delete('/invoices/' + id);
    toast.success('Deleted');
    fetchInvoices();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
        <Link to="/invoices/new" className="btn-primary">+ New Invoice</Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          className="input max-w-xs"
          placeholder="Search client, invoice no..."
          value={search}
          onChange={function (e) { setSearch(e.target.value); }}
        />
        <select
          className="input w-36"
          value={status}
          onChange={function (e) { setStatus(e.target.value); }}
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Invoice No</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Client</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Event</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Total</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Balance</th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="text-center px-5 py-3 text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && (
              <tr><td colSpan="7" className="text-center py-12 text-gray-400">Loading...</td></tr>
            )}
            {!loading && invoices.length === 0 && (
              <tr><td colSpan="7" className="text-center py-12 text-gray-400">No invoices found</td></tr>
            )}
            {invoices.map(function (inv) {
              return (
                <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-orange-600 font-medium">{inv.invoiceNo}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{inv.client?.name}</p>
                    <p className="text-xs text-gray-400">{inv.client?.phone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{inv.event || '—'}</td>
                  <td className="px-5 py-3.5 text-right font-medium">{fmt(inv.total)}</td>
                  <td className="px-5 py-3.5 text-right text-orange-600 font-medium">{fmt(inv.balance)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/invoices/${inv._id}`} className="text-blue-500 hover:underline text-xs">View</Link>
                      <Link to={`/invoices/${inv._id}/edit`} className="text-gray-500 hover:underline text-xs">Edit</Link>
                      <button
                        onClick={function () { deleteInvoice(inv._id); }}
                        className="text-red-400 hover:underline text-xs"
                      >Del</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
