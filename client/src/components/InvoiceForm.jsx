import { useState, useEffect, useRef } from 'react';
import api from '../api/axios.js';

const emptyService = { service: '', description: '', price: '', total: 0 };

export default function InvoiceForm({ initial, onSubmit, loading, onCustomerSelect }) {
  const [form, setForm] = useState(function () {
    const base = {
      customer: { name: '', phone: '' },
      eventCategory: '',
      event: '',
      eventDate: '',
      location: '',
      services: [{ ...emptyService }],
      discount: 0,
      advancePaid: 0,
      advancePaymentDate: new Date().toISOString().substring(0, 10),
      advancePaymentMethod: 'Cash',
      totalPaid: 0,
      totalPaymentDate: new Date().toISOString().substring(0, 10),
      totalPaymentMethod: 'Cash',
      status: 'draft',
      notes: 'Grateful to be part of your celebration.',
    };
    if (!initial) return base;
    return {
      ...base,
      ...initial,
      eventCategory: initial.eventCategory?._id || initial.eventCategory || '',
      customer: initial.customer || base.customer,
      services: initial.services?.length ? initial.services : base.services,
    };
  });

  const [eventCategories, setEventCategories] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [customerSearch, setCustomerSearch] = useState(initial?.customer?.name || '');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const customerTimer = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(function () {
    api.get('/event-categories').then(function (res) { setEventCategories(res.data); });

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setCustomerSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return function () {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(function () {
    const categoryId = form.eventCategory || initial?.eventCategory?._id || initial?.eventCategory;
    if (!categoryId) {
      setServiceOptions([]);
      return;
    }
    api.get('/services', { params: { category: categoryId } }).then(function (res) {
      setServiceOptions(res.data);
    });
  }, [form.eventCategory, initial?.eventCategory]);

  // Recalculate totals whenever services or discount change
  const subTotal = form.services.reduce(function (sum, s) { return sum + (Number(s.price) || 0); }, 0);
  const total = subTotal - Number(form.discount || 0);
  const balance = total - Number(form.advancePaid || 0) - Number(form.totalPaid || 0);

  function searchCustomers(val) {
    clearTimeout(customerTimer.current);
    setCustomerSearch(val);
    if (val.length < 2) { setCustomerSuggestions([]); return; }
    customerTimer.current = setTimeout(function () {
      api.get('/customers', { params: { search: val } }).then(function (res) {
        setCustomerSuggestions(res.data);
      });
    }, 300);
  }

  function selectCustomer(c) {
    clearTimeout(customerTimer.current);
    setForm(function (f) { return { ...f, customer: { name: c.name, phone: c.phone } }; });
    setCustomerSearch(c.name);
    setCustomerSuggestions([]);
    if (onCustomerSelect) onCustomerSelect(c);
  }

  function updateService(idx, field, val) {
    setForm(function (f) {
      const services = f.services.map(function (s, i) {
        if (i !== idx) return s;
        const updated = { ...s, [field]: val };
        updated.total = Number(updated.price) || 0;
        return updated;
      });
      return { ...f, services };
    });
  }

  function addService() {
    setForm(function (f) { return { ...f, services: [...f.services, { ...emptyService }] }; });
  }

  function removeService(idx) {
    setForm(function (f) {
      return { ...f, services: f.services.filter(function (_, i) { return i !== idx; }) };
    });
  }

  function handleCategoryChange(categoryId) {
    const category = eventCategories.find(function (c) { return c._id === categoryId; });
    setForm(function (f) {
      return {
        ...f,
        eventCategory: categoryId,
        event: category?.name || f.event,
        services: [{ ...emptyService }],
      };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const category = eventCategories.find(function (c) { return c._id === form.eventCategory; });
    onSubmit({
      ...form,
      subTotal,
      total,
      balance,
      eventCategory: form.eventCategory,
      eventCategoryName: category?.name || form.event,
      showTerms: category?.showTerms ?? true,
      termsAndConditions: category?.showTerms ? (category?.termsAndConditions || '') : '',
    });
  }

  const getDescriptions = function (serviceName) {
    const found = serviceOptions.find(function (s) { return s.name === serviceName; });
    return found ? found.descriptions : [];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Details */}
      <div className="card p-5">
        <h2 className="font-medium text-gray-900 mb-4">Customer Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Name with autocomplete */}
          <div className="relative" ref={wrapperRef}>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
            <input
              className="input"
              value={customerSearch}
              onChange={function (e) {
                searchCustomers(e.target.value);
                setForm(function (f) { return { ...f, customer: { ...f.customer, name: e.target.value } }; });
              }}
              placeholder="Search or type customer name"
              required
            />
            {customerSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {customerSuggestions.map(function (c) {
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={function () { selectCustomer(c); }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 border-b border-gray-50 last:border-0"
                    >
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.phone}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Phone *</label>
            <input
              className="input"
              value={form.customer.phone}
              onChange={function (e) { setForm(function (f) { return { ...f, customer: { ...f.customer, phone: e.target.value } }; }); }}
              placeholder="9842209736"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event Category *</label>
            <select
              className="input"
              value={form.eventCategory || initial?.eventCategory?._id || initial?.eventCategory || ''}
              onChange={function (e) { handleCategoryChange(e.target.value); }}
              required
            >
              <option value="">Select category</option>
              {eventCategories.map(function (c) {
                return <option key={c._id} value={c._id}>{c.name}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event Label</label>
            <input
              className="input"
              value={form.event}
              onChange={function (e) { setForm(function (f) { return { ...f, event: e.target.value }; }); }}
              placeholder="Engagement & Wedding"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Event Date</label>
            <input
              className="input"
              value={form.eventDate}
              onChange={function (e) { setForm(function (f) { return { ...f, eventDate: e.target.value }; }); }}
              placeholder="21/05/2026 & 24/06/2026"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
            <input
              className="input"
              value={form.location}
              onChange={function (e) { setForm(function (f) { return { ...f, location: e.target.value }; }); }}
              placeholder="kulasekharam"
            />
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="card p-5">
        <h2 className="font-medium text-gray-900 mb-1">Services</h2>
        {!form.eventCategory && !(initial?.eventCategory?._id || initial?.eventCategory) && (
          <p className="text-xs text-amber-600 mb-4">Select an event category above to load services.</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="text-xs font-medium text-gray-500 pb-3 pr-3 w-40">Service</th>
                <th className="text-xs font-medium text-gray-500 pb-3 pr-3 w-44">Description</th>
                <th className="text-xs font-medium text-gray-500 pb-3 pr-3 w-32">Price (₹)</th>
                <th className="text-xs font-medium text-gray-500 pb-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {form.services.map(function (s, idx) {
                return (
                  <tr key={idx}>
                    <td className="pr-3 pb-2">
                      <select
                        className="input"
                        value={s.service}
                        onChange={function (e) { updateService(idx, 'service', e.target.value); }}
                      >
                        <option value="">Select service</option>
                        {serviceOptions.map(function (opt) {
                          return <option key={opt.name} value={opt.name}>{opt.name}</option>;
                        })}
                      </select>
                    </td>
                    <td className="pr-3 pb-2">
                      {getDescriptions(s.service).length > 0 ? (
                        <select
                          className="input"
                          value={s.description}
                          onChange={function (e) { updateService(idx, 'description', e.target.value); }}
                        >
                          <option value="">Select type</option>
                          {getDescriptions(s.service).map(function (d) {
                            return <option key={d} value={d}>{d}</option>;
                          })}
                        </select>
                      ) : (
                        <input
                          className="input"
                          value={s.description}
                          onChange={function (e) { updateService(idx, 'description', e.target.value); }}
                          placeholder="Description"
                        />
                      )}
                    </td>
                    <td className="pr-3 pb-2">
                      <input
                        type="number"
                        className="input"
                        value={s.price}
                        onChange={function (e) { updateService(idx, 'price', e.target.value); }}
                        placeholder="0"
                        min="0"
                      />
                    </td>
                    <td className="pb-2">
                      {form.services.length > 1 && (
                        <button
                          type="button"
                          onClick={function () { removeService(idx); }}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                        >×</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addService} className="btn-secondary mt-3 text-xs">
          + Add Service Row
        </button>
      </div>

      {/* Totals + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h2 className="font-medium text-gray-900 mb-2">Payment Details</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Sub Total</span>
            <span className="font-medium">₹{subTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Discount (₹)</span>
            <input
              type="number"
              className="input w-32 text-right"
              value={form.discount}
              onChange={function (e) { setForm(function (f) { return { ...f, discount: e.target.value }; }); }}
              min="0"
            />
          </div>
          <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-2">
            <span>Total</span>
            <span className="text-orange-600">₹{total.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <span className="text-gray-500">Advance Paid (₹)</span>
            <input
              type="number"
              className="input w-32 text-right"
              value={form.advancePaid}
              onChange={function(e) { setForm(function(f) { return { ...f, advancePaid: e.target.value }; }); }}
              min="0"
            />
          </div>
          
          {Number(form.advancePaid) > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Date</span>
                <input
                  type="date"
                  className="input w-32"
                  value={form.advancePaymentDate}
                  onChange={function(e) { setForm(function(f) { return { ...f, advancePaymentDate: e.target.value }; }); }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <select
                  className="input w-32"
                  value={form.advancePaymentMethod}
                  onChange={function(e) { setForm(function(f) { return { ...f, advancePaymentMethod: e.target.value }; }); }}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm pt-2 mt-2 border-t border-gray-50">
            <span className="text-gray-500">2nd / Final Paid (₹)</span>
            <input
              type="number"
              className="input w-32 text-right"
              value={form.totalPaid}
              onChange={function(e) { setForm(function(f) { return { ...f, totalPaid: e.target.value }; }); }}
              min="0"
            />
          </div>
          
          {Number(form.totalPaid) > 0 && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Date</span>
                <input
                  type="date"
                  className="input w-32"
                  value={form.totalPaymentDate}
                  onChange={function(e) { setForm(function(f) { return { ...f, totalPaymentDate: e.target.value }; }); }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Method</span>
                <select
                  className="input w-32"
                  value={form.totalPaymentMethod}
                  onChange={function(e) { setForm(function(f) { return { ...f, totalPaymentMethod: e.target.value }; }); }}
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold bg-orange-50 px-3 py-2 rounded-lg mt-4">
            <span className="text-orange-700">Balance Due</span>
            <span className="text-orange-600">₹{balance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-medium text-gray-900 mb-2">Invoice Settings</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={function (e) { setForm(function (f) { return { ...f, status: e.target.value }; }); }}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              className="input resize-none"
              rows={4}
              value={form.notes}
              onChange={function (e) { setForm(function (f) { return { ...f, notes: e.target.value }; }); }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" disabled={loading} className="btn-primary px-8">
          {loading ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </form>
  );
}
