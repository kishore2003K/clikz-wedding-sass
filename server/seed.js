const EventCategory = require('./models/EventCategory');
const Service = require('./models/Service');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const EVENT_TERMS = `1. Advance payment is non-refundable once booking is confirmed.
2. Full balance must be cleared before final album / video delivery.
3. Event dates are reserved only after advance payment is received.
4. CLIKZ Wedding Films may reschedule only in case of genuine emergencies.
5. Meals and basic accommodation for the crew must be arranged by the client for multi-day events.
6. Raw footage and project files remain property of CLIKZ until full payment is completed.`;

async function seedDefaults() {

  if (await EventCategory.countDocuments() > 0) return;

  const [marriage, puberty, birthday, products] = await EventCategory.insertMany([
    { name: 'Marriage', showTerms: true, termsAndConditions: EVENT_TERMS },
    { name: 'Puberty', showTerms: true, termsAndConditions: EVENT_TERMS },
    { name: 'Birthday', showTerms: true, termsAndConditions: EVENT_TERMS },
    { name: 'Photo Products', showTerms: false, termsAndConditions: '' },
  ]);

  if (await Service.countDocuments() > 0) return;

  await Service.insertMany([
    { name: 'Engagement', descriptions: ['Traditional', 'Candid', 'Candid & Traditional'], eventCategory: marriage._id },
    { name: 'Wedding', descriptions: ['Traditional', 'Candid', 'Candid & Traditional', 'Cinematic'], eventCategory: marriage._id },
    { name: 'Reception', descriptions: ['Traditional', 'Candid', 'Candid & Traditional'], eventCategory: marriage._id },
    { name: 'Pre-wedding Shoot', descriptions: ['Outdoor', 'Studio', 'Outdoor & Studio'], eventCategory: marriage._id },
    { name: 'Album', descriptions: ['12x15 inch', '15x18 inch', 'Coffee Table Book'], eventCategory: marriage._id },
    { name: 'Video Edit', descriptions: ['Highlight Film', 'Full Documentary', 'Cinematic Edit'], eventCategory: marriage._id },
    { name: 'Drone Shoot', descriptions: ['Half Day', 'Full Day'], eventCategory: marriage._id },
    { name: 'Puberty Shoot', descriptions: ['Traditional', 'Candid'], eventCategory: puberty._id },
    { name: 'Birthday Shoot', descriptions: ['Indoor', 'Outdoor'], eventCategory: birthday._id },
    { name: 'Photo Frame', descriptions: ['6x8', '8x10', '12x15', 'With Photo'], eventCategory: products._id },
    { name: 'Phone Case with Photo', descriptions: ['Standard', 'Premium'], eventCategory: products._id },
  ]);
}

module.exports = seedDefaults;
