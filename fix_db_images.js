import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/Category.js';
import Destination from './src/models/Destination.js';
import Package from './src/models/Package.js';

dotenv.config();

const badIds = [
  'photo-1526761122248-c31c93f8b299',
  'photo-1579402925501-c89b7b9d6a36',
  'photo-1599859556100-2440938ff5d5',
  'photo-1627582236203-0c4e09fde119',
  'photo-1615836245337-f5b9b230bc18',
  'photo-1564507592208-0287afa58b5e',
  'photo-1593693397690-362cb9666c6b',
  'photo-1605649487212-4d4ce7a9d0a1',
  'photo-1621876547631-50a1df277da2',
  'photo-1588691505307-e17f259db1f2',
  'photo-1589394815804-964ce0fa58c4',
  'photo-1601007204439-d3e75e1141fc'
];

const goodId = 'photo-1436491865332-7a61a109cc05';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Fix Categories
    const categories = await Category.find();
    for(let c of categories) {
      if(c.image && badIds.some(id => c.image.includes(id))) {
        badIds.forEach(id => { c.image = c.image.replace(id, goodId); });
        await c.save();
        console.log('Fixed category:', c.name);
      }
    }

    // Fix Destinations
    const destinations = await Destination.find();
    for(let d of destinations) {
      let changed = false;
      if(d.image && badIds.some(id => d.image.includes(id))) {
        badIds.forEach(id => { d.image = d.image.replace(id, goodId); });
        changed = true;
      }
      if(d.banner && badIds.some(id => d.banner.includes(id))) {
        badIds.forEach(id => { d.banner = d.banner.replace(id, goodId); });
        changed = true;
      }
      if(d.gallery && d.gallery.length) {
        d.gallery = d.gallery.map(g => {
          let updated = g;
          badIds.forEach(id => { updated = updated.replace(id, goodId); });
          if(updated !== g) changed = true;
          return updated;
        });
      }
      if(changed) {
        await d.save();
        console.log('Fixed destination:', d.name);
      }
    }

    // Fix Packages
    const packages = await Package.find();
    for(let p of packages) {
      let changed = false;
      if(p.thumbnail && badIds.some(id => p.thumbnail.includes(id))) {
        badIds.forEach(id => { p.thumbnail = p.thumbnail.replace(id, goodId); });
        changed = true;
      }
      if(p.coverImage && badIds.some(id => p.coverImage.includes(id))) {
        badIds.forEach(id => { p.coverImage = p.coverImage.replace(id, goodId); });
        changed = true;
      }
      if(p.images && p.images.length) {
        p.images = p.images.map(img => {
          let updated = img;
          badIds.forEach(id => { updated = updated.replace(id, goodId); });
          if(updated !== img) changed = true;
          return updated;
        });
      }
      if(p.itinerary && p.itinerary.length) {
        p.itinerary = p.itinerary.map(day => {
          if(day.image && badIds.some(id => day.image.includes(id))) {
            badIds.forEach(id => { day.image = day.image.replace(id, goodId); });
            changed = true;
          }
          return day;
        });
      }
      if(changed) {
        await p.save();
        console.log('Fixed package:', p.title);
      }
    }

    console.log('Database fix complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
