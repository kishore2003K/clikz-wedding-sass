import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { IndianRupee, CheckCircle2, Clock, FileText } from 'lucide-react';
import api from '../api/axios.js';

const statusColors = {
  draft: 'bg-gray-100 text-gray-600',
  sent: 'bg-blue-100 text-blue-700',
  partial: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
};

function fmt(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    api.get('/dashboard').then(function (res) {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
    );
  }

  const stats = [
    { label: 'Total Revenue', value: fmt(data.totalRevenue), Icon: IndianRupee, color: 'text-green-600', iconColor: '#16a34a' },
    { label: 'Received', value: fmt(data.totalReceived), Icon: CheckCircle2, color: 'text-blue-600', iconColor: '#2563eb' },
    { label: 'Balance Due', value: fmt(data.totalBalance), Icon: Clock, color: 'text-orange-600', iconColor: '#ea580c' },
    { label: 'Total Invoices', value: data.totalInvoices, Icon: FileText, color: 'text-purple-600', iconColor: '#9333ea' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">CLIKZ Wedding Films — Billing Overview</p>
        </div>
        <Link to="/invoices/new" className="btn-primary">+ New Invoice</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(function (s) {
          const StatIcon = s.Icon;
          return (
            <div key={s.label} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{s.label}</p>
                <StatIcon size={20} color={s.iconColor} strokeWidth={2} />
              </div>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {['draft', 'sent', 'partial', 'paid'].map(function (s) {
          return (
            <div key={s} className="card px-5 py-4 flex items-center justify-between">
              <span className="text-sm capitalize text-gray-600">{s} invoices</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[s]}`}>
                {data.statusMap[s] || 0}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent invoices */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">Recent Invoices</h2>
          <Link to="/invoices" className="text-xs text-orange-500 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(data.recentInvoices || []).map(function (inv) {
            return (
              <Link
                key={inv._id}
                to={`/invoices/${inv._id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.client?.name}</p>
                  <p className="text-xs text-gray-400">{inv.invoiceNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{fmt(inv.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>
                    {inv.status}
                  </span>
                </div>
              </Link>
            );
          })}
          {!data.recentInvoices?.length && (
            <p className="text-sm text-gray-400 px-5 py-8 text-center">No invoices yet. Create your first one!</p>
          )}
        </div>
      </div>
    </div>
  );
}
