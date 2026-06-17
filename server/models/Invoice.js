const mongoose = require('mongoose');

const serviceLineSchema = new mongoose.Schema({
  service: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, unique: true },
  date: { type: Date, default: Date.now },
  client: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  event: { type: String, default: '' },
  eventCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'EventCategory' },
  eventCategoryName: { type: String, default: '' },
  showTerms: { type: Boolean, default: true },
  termsAndConditions: { type: String, default: '' },
  eventDate: { type: String, default: '' },
  location: { type: String, default: '' },
  services: [serviceLineSchema],
  subTotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  advancePaid: { type: Number, default: 0 },
  advancePaymentDate: { type: String, default: '' },
  advancePaymentMethod: { type: String, default: 'Cash' },
  totalPaid: { type: Number, default: 0 },
  totalPaymentDate: { type: String, default: '' },
  totalPaymentMethod: { type: String, default: 'Cash' },
  balance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'sent', 'partial', 'paid'],
    default: 'draft',
  },
  notes: { type: String, default: 'Grateful to be part of your celebration.' },
}, { timestamps: true });

// Auto-generate invoice number before saving
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNo) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNo = `CWF-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
