import logger from './logger.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Destination from '../models/Destination.js';
import Package from '../models/Package.js';
import Category from '../models/Category.js';
import Country from '../models/Country.js';
import City from '../models/City.js';
import Blog from '../models/Blog.js';
import Coupon from '../models/Coupon.js';
import Wallet from '../models/Wallet.js';
dotenv.config();

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}), Destination.deleteMany({}), Package.deleteMany({}),
    Category.deleteMany({}), Country.deleteMany({}), City.deleteMany({}),
    Blog.deleteMany({}), Coupon.deleteMany({}), Wallet.deleteMany({})
  ]);

  // Users
  const admin = await User.create({ name: 'Admin', email: 'admin@b2bholidays.com', password: 'admin123', role: 'admin', isVerified: true });
  const agent = await User.create({ name: 'Skyline Travels', email: 'agent@b2bholidays.com', password: 'agent123', role: 'agent', agencyName: 'Skyline Travels', approved: true, creditLimit: 500000, markupPercent: 8, isVerified: true });
  const user = await User.create({ name: 'Nitin Kumar', email: 'user@b2bholidays.com', password: 'user123', role: 'user', isVerified: true });
  await Wallet.create([{ user: agent._id, balance: 250000 }, { user: user._id, balance: 15000 }]);

  // Countries
  const countryData = [
    ['Indonesia','ID','Asia'], ['Maldives','MV','Asia'], ['United Arab Emirates','AE','Asia'],
    ['Switzerland','CH','Europe'], ['Thailand','TH','Asia'], ['Singapore','SG','Asia'], ['India','IN','Asia']
  ];
  const countries = await Country.insertMany(countryData.map(([name,code,continent]) => ({ name, slug: slugify(name), code, continent, image: img('photo-1488646953014-85cb44e25828') })));
  const cmap = Object.fromEntries(countries.map(c => [c.name, c]));

  // Cities
  const cityData = [
    ['Bali','Bali','Indonesia'], ['Male','Kaafu','Maldives'], ['Dubai','Dubai','United Arab Emirates'],
    ['Zurich','Zurich','Switzerland'], ['Phuket','Phuket','Thailand'], ['Singapore','Central','Singapore'],
    ['Kochi','Kerala','India'], ['Srinagar','J&K','India'], ['Jaipur','Rajasthan','India'], ['Panaji','Goa','India'],
    ['Manali','Himachal','India'], ['Port Blair','Andaman','India']
  ];
  await City.insertMany(cityData.map(([name,state,country]) => ({ name, slug: slugify(name), state, countryName: country, country: cmap[country]?._id })));

  // Categories (14)
  const catData = [
    ['International Holidays', 'photo-1476514525535-07fb3b4ae5f1', 34999],
    ['Domestic Holidays', 'photo-1512343879784-a960bf40e7f2', 15999],
    ['Honeymoon Packages', 'photo-1518495973542-4542c06a5843', 42999],
    ['Family Holidays', 'photo-1602002418082-a4443e081dd1', 28999],
    ['Adventure Tours', 'photo-1533130061792-64b345e4a833', 24999],
    ['Luxury Holidays', 'photo-1520250497591-112f2f40a3f4', 89999],
    ['Pilgrimage Tours', 'photo-1548013146-72479768bada', 18999],
    ['Wildlife Tours', 'photo-1549366021-9f761d450615', 26999],
    ['Beach Holidays', 'photo-1507525428034-b723cf961d3e', 32999],
    ['Hill Station Packages', 'photo-1626621341517-bbf3d9990a23', 17999],
    ['Group Tours', 'photo-1517048676732-d65bc937f952', 21999],
    ['Corporate Tours', 'photo-1522071820081-009f0129c71c', 45999],
    ['Weekend Getaways', 'photo-1476514525535-07fb3b4ae5f1', 9999],
    ['Cruise Holidays', 'photo-1548574505-5e239809ee19', 64999]
  ];
  const categories = await Category.insertMany(catData.map(([name, im, price], i) => ({
    name, slug: slugify(name), image: img(im),
    description: `Explore our curated ${name.toLowerCase()} with premium hotels, seamless transfers and expert guides.`,
    startingPrice: price, displayOrder: i, featured: i < 6, packageCount: 0
  })));
  const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c]));

  // Destinations (12) with rich detail
  const weather = [
    { month: 'Jan-Mar', temp: '26-31°C', note: 'Peak season, sunny & dry' },
    { month: 'Apr-Jun', temp: '28-34°C', note: 'Warm, fewer crowds' },
    { month: 'Jul-Sep', temp: '25-30°C', note: 'Occasional showers' },
    { month: 'Oct-Dec', temp: '24-29°C', note: 'Pleasant, festive season' }
  ];
  
  const galleriesMap = {
    'Goa': [img('photo-1512343879784-a960bf40e7f2'), img('photo-1599059021750-82716ae2b661'), img('photo-1614082242765-7c98ca0f3df3'), img('photo-1587922546307-776227941871'), img('photo-1436491865332-7a61a109cc05')],
    'Kashmir': [img('photo-1595815771614-ade9d652a65d'), img('photo-1598091383021-15ddea10925d'), img('photo-1436491865332-7a61a109cc05'), img('photo-1436491865332-7a61a109cc05'), img('photo-1436491865332-7a61a109cc05')],
    'Dubai': [img('photo-1512453979798-5ea266f8880c'), img('photo-1582672060674-bc2bd808a8b5'), img('photo-1526495124232-a04e1849168c'), img('photo-1546412414-e1885259563a'), img('photo-1528702748617-c64d49f918af')],
    'Bali': [img('photo-1537996194471-e657df975ab4'), img('photo-1555400038-63f5ba517a47'), img('photo-1537953773345-d172ccf13cf1'), img('photo-1573790387438-4da905039392'), img('photo-1518548419970-58e3b4079ab2')],
    'Rajasthan': [img('photo-1477587458883-47145ed94245'), img('photo-1603262110263-fb0112e7cc33'), img('photo-1436491865332-7a61a109cc05'), img('photo-1436491865332-7a61a109cc05'), img('photo-1587474260584-136574528ed5')],
    'Maldives': [img('photo-1514282401047-d79a71a590e8'), img('photo-1602002418082-a4443e081dd1'), img('photo-1582672060674-bc2bd808a8b5'), img('photo-1573790387438-4da905039392'), img('photo-1537996194471-e657df975ab4')],
    'Switzerland': [img('photo-1531366936337-7c912a4589a7'), img('photo-1530122037265-a5f1f91d3b99'), img('photo-1546412414-e1885259563a'), img('photo-1502602898657-3e91760cbb34'), img('photo-1526495124232-a04e1849168c')],
    'Manali': [img('photo-1626621341517-bbf3d9990a23'), img('photo-1436491865332-7a61a109cc05'), img('photo-1436491865332-7a61a109cc05'), img('photo-1436491865332-7a61a109cc05'), img('photo-1436491865332-7a61a109cc05')],
    'Kerala': [img('photo-1602216056096-3b40cc0c9944'), img('photo-1436491865332-7a61a109cc05'), img('photo-1593693411515-c20261bcad6e'), img('photo-1436491865332-7a61a109cc05'), img('photo-1436491865332-7a61a109cc05')],
    'Andaman': [img('photo-1589979481223-deb893043163'), img('photo-1436491865332-7a61a109cc05'), img('photo-1507525428034-b723cf961d3e'), img('photo-1519046904884-53103b34b206'), img('photo-1602002418082-a4443e081dd1')]
  };

  const getGallery = (name, defaultIm) => galleriesMap[name] || [img(defaultIm), img(defaultIm), img(defaultIm), img(defaultIm), img(defaultIm)];

  const faqs = [
    { question: 'Do I need a visa?', answer: 'Visa requirements depend on your nationality. We provide full visa assistance for all international destinations.' },
    { question: 'What is the best time to book?', answer: 'Booking 45-60 days in advance secures the best rates and availability.' },
    { question: 'Are flights included?', answer: 'Many packages include flights. Check individual package details or filter by "Flights Included".' }
  ];

  const destSpecs = [
    ['Bali','Indonesia','international','photo-1537996194471-e657df975ab4', 41399, ['Uluwatu Temple','Tegallalang Rice Terraces','Seminyak Beach','Mount Batur'], 'Island of gods with beaches, temples and rice terraces.'],
    ['Maldives','Maldives','international','photo-1514282401047-d79a71a590e8', 80999, ['Overwater Villas','Coral Reefs','Sandbank Picnics','Sunset Cruise'], 'Overwater villas and turquoise lagoons for the ultimate luxury escape.'],
    ['Dubai','United Arab Emirates','international','photo-1512453979798-5ea266f8880c', 49499, ['Burj Khalifa','Desert Safari','Palm Jumeirah','Dubai Mall'], 'Futuristic skyline, desert safaris and luxury shopping.'],
    ['Switzerland','Switzerland','international','photo-1531366936337-7c912a4589a7', 112499, ['Jungfraujoch','Lake Geneva','Glacier Express','Mount Titlis'], 'Alpine peaks, scenic trains and pristine lakes.'],
    ['Phuket','Thailand','international','photo-1552465011-b4e21bf6e79a', 27999, ['Phi Phi Islands','Patong Beach','Big Buddha','Old Town'], 'Thailand\'s largest island with beaches and vibrant nightlife.'],
    ['Singapore','Singapore','international','photo-1525625293386-3f8f99389edd', 38999, ['Marina Bay Sands','Gardens by the Bay','Sentosa','Universal Studios'], 'A dazzling city-state of gardens, skylines and world-class attractions.'],
    ['Kerala','India','domestic','photo-1602216056096-3b40cc0c9944', 26099, ['Alleppey Backwaters','Munnar Tea Gardens','Fort Kochi','Periyar'], 'Backwaters, houseboats and lush greenery in God\'s Own Country.'],
    ['Kashmir','India','domestic','photo-1566837945700-30057527ade0', 31499, ['Dal Lake','Gulmarg Gondola','Pahalgam','Mughal Gardens'], 'Paradise on earth with valleys, shikaras and snow-capped peaks.'],
    ['Rajasthan','India','domestic','photo-1477587458883-47145ed94245', 35999, ['Amber Fort','City Palace','Thar Desert','Lake Pichola'], 'Royal forts, palaces and vibrant desert culture.'],
    ['Goa','India','domestic','photo-1512343879784-a960bf40e7f2', 17099, ['Baga Beach','Old Goa Churches','Dudhsagar Falls','Fort Aguada'], 'Sun, sand and vibrant nightlife with Portuguese heritage.'],
    ['Manali','India','domestic','photo-1626621341517-bbf3d9990a23', 15999, ['Solang Valley','Rohtang Pass','Hidimba Temple','Old Manali'], 'Himalayan hill station for snow, adventure and serene valleys.'],
    ['Andaman','India','domestic','photo-1589979481223-deb893043163', 33999, ['Radhanagar Beach','Cellular Jail','Havelock Island','Scuba Diving'], 'Pristine islands with white-sand beaches and coral reefs.']
  ];

  const destinations = await Destination.insertMany(destSpecs.map(([name, country, type, im, price, attr, short], i) => {
    const destGallery = getGallery(name, im);
    return {
      name, slug: slugify(name), country, type,
      image: img(im), banner: img(im), heroImage: destGallery[0], gallery: destGallery,
      shortDescription: short,
      overview: `${name} is one of the most sought-after ${type} destinations. ${short} From iconic landmarks to hidden gems, ${name} offers a perfectly balanced holiday for couples, families and groups alike. Our B2B partners get exclusive rates on curated ${name} experiences.`,
      tourCount: 6 + (i % 7), startingPrice: price, rating: +(4.5 + (i % 5) / 10).toFixed(1), reviewCount: 40 + i * 7,
      bestTimeToVisit: type === 'international' ? 'October to April' : 'September to March',
      weather, topAttractions: attr.map((n, idx) => ({ name: n, image: destGallery[idx % destGallery.length], description: 'A must-visit highlight offering unforgettable experiences.' })),
      thingsToDo: ['Guided city tours', 'Local cuisine tasting', 'Water & adventure activities', 'Cultural shows', 'Shopping excursions'],
      travelTips: ['Carry valid ID and travel documents', 'Book activities in advance during peak season', 'Respect local customs and dress codes', 'Keep emergency contacts handy'],
      mapEmbed: `${name}, ${country}`, faqs,
      displayOrder: i, featured: i < 8, popular: true
    };
  }));
  const dmap = Object.fromEntries(destinations.map(d => [d.name, d]));

  // Packages (14 best sellers, category-assigned)
  const themeFor = (catSlug) => ({
    'honeymoon-packages': ['honeymoon','luxury'], 'family-holidays': ['family'], 'adventure-tours': ['adventure'],
    'luxury-holidays': ['luxury'], 'beach-holidays': ['weekend','family'], 'cruise-holidays': ['cruise','luxury'],
    'international-holidays': ['luxury','family'], 'domestic-holidays': ['family','weekend'], 'hill-station-packages': ['adventure','weekend'],
    'pilgrimage-tours': ['pilgrimage'], 'group-tours': ['corporate'], 'corporate-tours': ['corporate'], 'weekend-getaways': ['weekend'], 'wildlife-tours': ['adventure']
  }[catSlug] || ['luxury']);

  const pkgSpecs = [
    ['Bali','Bali Luxury Honeymoon Escape','honeymoon-packages',5,45999,5,true,'All Meals'],
    ['Maldives','Maldives Overwater Paradise','luxury-holidays',4,89999,5,true,'All Inclusive'],
    ['Dubai','Dubai Extravaganza & Desert Safari','family-holidays',5,54999,5,true,'Breakfast + Dinner'],
    ['Switzerland','Switzerland Alpine Grand Tour','international-holidays',7,124999,5,true,'Breakfast + Dinner'],
    ['Phuket','Phuket Beach & Island Hopping','beach-holidays',5,27999,4,true,'Breakfast'],
    ['Singapore','Singapore City & Sentosa Fun','family-holidays',5,38999,4,true,'Breakfast'],
    ['Kerala','Kerala Backwaters & Hills','domestic-holidays',5,28999,4,false,'Breakfast + Dinner'],
    ['Kashmir','Kashmir Valley Delight','honeymoon-packages',6,34999,4,true,'Breakfast + Dinner'],
    ['Rajasthan','Royal Rajasthan Heritage Tour','luxury-holidays',6,39999,5,false,'Breakfast'],
    ['Goa','Goa Beach & Nightlife Getaway','weekend-getaways',4,18999,4,false,'Breakfast'],
    ['Manali','Manali Snow Adventure','adventure-tours',5,17999,3,false,'Breakfast + Dinner'],
    ['Andaman','Andaman Islands Scuba Special','beach-holidays',6,33999,4,true,'Breakfast'],
    ['Kerala','Kerala Pilgrimage Special','pilgrimage-tours',4,21999,3,false,'All Meals'],
    ['Dubai','Dubai Gulf Cruise Combo','cruise-holidays',5,64999,5,true,'All Inclusive']
  ];

  const packages = pkgSpecs.map(([destName, title, catSlug, days, price, rating, flight, meal], i) => {
    const d = dmap[destName]; const cat = catBySlug[catSlug];
    const destGallery = getGallery(destName, 'photo-1488646953014-85cb44e25828');
    return {
      title, slug: slugify(title), destination: d._id, country: d.country, city: d.name, state: '', type: d.type,
      theme: themeFor(catSlug), category: cat._id, categorySlug: catSlug,
      summary: `${title} — a handpicked ${days}-day experience in ${destName}.`,
      description: `${title}. Enjoy a meticulously curated experience with handpicked hotels, seamless transfers and expert local guides across ${destName}.`,
      highlights: d.topAttractions.map(a => a.name),
      itinerary: Array.from({ length: days }, (_, k) => ({ day: k + 1, title: `Day ${k + 1}: ${k === 0 ? 'Arrival & check-in' : k === days - 1 ? 'Departure' : 'Sightseeing & experiences'}`, description: 'Guided experiences, curated meals and comfortable transfers throughout the day.' })),
      inclusions: ['Accommodation', 'Daily breakfast', 'Airport transfers', 'Sightseeing', 'Local guide', ...(flight ? ['Return airfare'] : [])],
      exclusions: ['Personal expenses', 'Travel insurance', 'Anything not in inclusions'],
      terms: ['Rates per person on twin sharing', 'Subject to availability at booking'],
      cancellationPolicy: '25% up to 30 days, 50% up to 15 days, 100% within 7 days of departure.',
      thumbnail: destGallery[0], coverImage: destGallery[0], gallery: destGallery, images: destGallery, video: '',
      durationDays: days, durationNights: days - 1, hotelRating: rating,
      price, discountPrice: Math.round(price * 0.9),
      meals: meal, mealPlan: meal, transport: 'Private AC vehicle',
      flightIncluded: flight, visaIncluded: d.type === 'international',
      availableDates: [new Date(Date.now() + 7 * 864e5), new Date(Date.now() + 21 * 864e5), new Date(Date.now() + 45 * 864e5)],
      fixedDeparture: i % 3 === 0, featured: i < 8, popular: i % 2 === 0, bestSelling: true, trending: i % 3 === 0,
      displayOrder: i, tags: themeFor(catSlug),
      seo: { metaTitle: title, metaDescription: `Book ${title} at exclusive B2B rates.` },
      rating: +(4.5 + (i % 5) / 10).toFixed(1), reviewCount: 25 + i * 4
    };
  });
  await Package.insertMany(packages);

  // update category package counts
  for (const c of categories) {
    const count = await Package.countDocuments({ categorySlug: c.slug });
    await Category.findByIdAndUpdate(c._id, { packageCount: count });
  }

  await Blog.insertMany([
    { title: 'Top 10 Luxury Destinations for 2025', slug: 'top-10-luxury-destinations-2025', excerpt: 'Discover the most breathtaking luxury escapes to sell this season.', content: 'Full guide...', cover: galleriesMap['Dubai'][0], author: 'B2BHolidays Team', category: 'Guides', tags: ['luxury'] },
    { title: 'How Agents Can Boost Holiday Sales', slug: 'boost-holiday-sales', excerpt: 'Proven strategies for travel agents.', content: 'Learn how...', cover: galleriesMap['Bali'][0], author: 'B2BHolidays Team', category: 'Business', tags: ['agents'] },
    { title: 'Maldives vs Bali: Which to Recommend?', slug: 'maldives-vs-bali', excerpt: 'A detailed comparison for honeymooners.', content: 'Comparing...', cover: galleriesMap['Maldives'][0], author: 'B2BHolidays Team', category: 'Comparison', tags: ['maldives','bali'] }
  ]);

  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percent', value: 10, minAmount: 20000, maxDiscount: 8000 },
    { code: 'AGENT15', type: 'percent', value: 15, minAmount: 50000, maxDiscount: 20000 },
    { code: 'FLAT5000', type: 'flat', value: 5000, minAmount: 40000 }
  ]);

  logger.info('Seed complete:', { countries: countries.length, categories: categories.length, destinations: destinations.length, packages: packages.length });
  logger.info('Admin: admin@b2bholidays.com / admin123');
  logger.info('Agent: agent@b2bholidays.com / agent123');
  logger.info('User : user@b2bholidays.com / user123');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((e) => { logger.error(e); process.exit(1); });
