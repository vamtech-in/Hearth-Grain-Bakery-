import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const INITIAL_DATA = {
  menu: [
    // Bread
    {
      id: 'br-1',
      name: 'Country Sourdough',
      category: 'bread',
      price: 180,
      description: '36-hour slow fermentation with wild yeast, open crumb and caramelized crust.',
      tags: ['Wild Yeast', '36h Ferment', 'Vegan'],
      inStock: true,
      image: '/images/image4.jpg'
    },
    {
      id: 'br-2',
      name: 'Seeded Rye',
      category: 'bread',
      price: 220,
      description: 'Dense, aromatic rye loaf crusted with toasted flaxseed, sunflower seeds, and caraway.',
      tags: ['Whole Grain', 'Seeded', 'Nutty'],
      inStock: true,
      image: '/images/image1.jpg'
    },
    {
      id: 'br-3',
      name: 'Baguette Tradition',
      category: 'bread',
      price: 150,
      description: 'Crisp, blistered crust with a light, airy crumb made according to French artisan standards.',
      tags: ['French Heritage', 'Crisp Crust'],
      inStock: true,
      image: '/images/image4.jpg'
    },
    {
      id: 'br-4',
      name: 'Whole Wheat Loaf',
      category: 'bread',
      price: 190,
      description: 'Stone-ground heritage wheat loaf, naturally sweet and rich in fiber.',
      tags: ['Stoneground', 'Healthy', 'Vegan'],
      inStock: true,
      image: '/images/image1.jpg'
    },
    {
      id: 'br-5',
      name: 'Olive & Rosemary Focaccia',
      category: 'bread',
      price: 210,
      description: 'Generously drizzled with extra virgin olive oil, Kalamata olives, and fresh organic rosemary.',
      tags: ['EVOO', 'Herbed', 'Fluffy'],
      inStock: true,
      image: '/images/image4.jpg'
    },

    // Pastry
    {
      id: 'pa-1',
      name: 'Butter Croissant',
      category: 'pastry',
      price: 120,
      description: 'Honeycomb interior, flaky exterior made with 84% butterfat Normandy butter.',
      tags: ['Normandy Butter', 'Flaky', 'Fresh Daily'],
      inStock: true,
      image: '/images/image3.jpg'
    },
    {
      id: 'pa-2',
      name: 'Almond Croissant',
      category: 'pastry',
      price: 160,
      description: 'Twice-baked butter croissant filled with rich almond frangipane and topped with toasted sliced almonds.',
      tags: ['Frangipane', 'Almond', 'Twice-Baked'],
      inStock: true,
      image: '/images/image3.jpg'
    },
    {
      id: 'pa-3',
      name: 'Cinnamon Babka',
      category: 'pastry',
      price: 180,
      description: 'Swirled brioche dough layered with Saigon cinnamon, dark brown sugar, and dark chocolate.',
      tags: ['Cinnamon', 'Dark Chocolate', 'Brioche'],
      inStock: true,
      image: '/images/image3.jpg'
    },
    {
      id: 'pa-4',
      name: 'Seasonal Danish',
      category: 'pastry',
      price: 150,
      description: 'Crisp lamination with Tahitian vanilla pastry cream and fresh seasonal fruit compote.',
      tags: ['Vanilla Cream', 'Seasonal Fruit'],
      inStock: true,
      image: '/images/image3.jpg'
    },
    {
      id: 'pa-5',
      name: 'Pain au Chocolat',
      category: 'pastry',
      price: 140,
      description: 'Golden, flaky layered pastry stuffed with two batons of 55% Belgian dark chocolate.',
      tags: ['Belgian Chocolate', 'Flaky'],
      inStock: true,
      image: '/images/image3.jpg'
    },

    // Coffee
    {
      id: 'co-1',
      name: 'Espresso',
      category: 'coffee',
      price: 100,
      description: 'Double shot of single-origin beans roasted medium-dark with notes of cacao and hazelnut.',
      tags: ['Double Shot', 'Single Origin'],
      inStock: true,
      image: '/images/image5.jpg'
    },
    {
      id: 'co-2',
      name: 'Americano',
      category: 'coffee',
      price: 120,
      description: 'Rich espresso poured over hot filtered spring water for a silky, lingering finish.',
      tags: ['Smooth', 'Aromatic'],
      inStock: true,
      image: '/images/image5.jpg'
    },
    {
      id: 'co-3',
      name: 'Cappuccino',
      category: 'coffee',
      price: 160,
      description: 'Equal parts espresso, steamed milk, and velvety micro-foam dusted with cocoa powder.',
      tags: ['Micro-foam', 'Velvety'],
      inStock: true,
      image: '/images/image5.jpg'
    },
    {
      id: 'co-4',
      name: 'Cold Brew',
      category: 'coffee',
      price: 180,
      description: 'Steeped cold for 18 hours for an ultra-smooth, low-acidity refreshing brew.',
      tags: ['18h Steep', 'Refreshing', 'Iced'],
      inStock: true,
      image: '/images/image5.jpg'
    },
    {
      id: 'co-5',
      name: 'Oat Milk Flat White',
      category: 'coffee',
      price: 170,
      description: 'Ristretto shots paired with velvety steamed barista oat milk.',
      tags: ['Plant-Based', 'Silky'],
      inStock: true,
      image: '/images/image5.jpg'
    }
  ],

  schedule: [
    { index: 0, dayName: 'SUN', name: 'Sunday', bake: 'Cinnamon Babka & Brioche', time: '8:00 AM', description: 'Sunday brunch specialty with fresh swirled babka and orange zest brioche.' },
    { index: 1, dayName: 'MON', name: 'Monday', bake: 'Miche au Levain', time: '8:00 AM', description: 'Hearty round rustic sourdough made with stoneground whole wheat.' },
    { index: 2, dayName: 'TUE', name: 'Tuesday', bake: 'Seeded Rye', time: '8:00 AM', description: 'Crusted with toasted flaxseed, sunflower seeds, and wild caraway.' },
    { index: 3, dayName: 'WED', name: 'Wednesday', bake: 'Pain de Campagne', time: '8:00 AM', description: 'Traditional French country boule, perfect for pairing with cheeses.' },
    { index: 4, dayName: 'THU', name: 'Thursday', bake: 'Sesame Whole Wheat', time: '8:00 AM', description: 'Toasted sesame seed crust with a tender, moist crumb.' },
    { index: 5, dayName: 'FRI', name: 'Friday', bake: 'Baguette Tradition & Challah', time: '8:00 AM', description: 'Crisp Parisian baguettes and golden braided egg challah.' },
    { index: 6, dayName: 'SAT', name: 'Saturday', bake: 'Olive & Rosemary Fougasse', time: '8:00 AM', description: 'Leaf-patterned Provencal bread bursting with black olives and olive oil.' }
  ],

  orders: [
    {
      id: 'HG-7821',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      customerName: 'Aarav Sharma',
      customerPhone: '+91 98201 11223',
      customerEmail: 'aarav.sharma@example.com',
      fulfillmentType: 'pickup',
      pickupTime: '11:00 AM',
      paymentMethod: 'counter',
      status: 'Ready for Pickup',
      items: [
        { id: 'br-1', name: 'Country Sourdough', price: 180, quantity: 1 },
        { id: 'pa-1', name: 'Butter Croissant', price: 120, quantity: 2 }
      ],
      subtotal: 420,
      packagingFee: 15,
      total: 435,
      notes: 'Please slice the Country Sourdough loaf.'
    },
    {
      id: 'HG-7820',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      customerName: 'Priya Mehta',
      customerPhone: '+91 98112 33445',
      customerEmail: 'priya.mehta@example.com',
      fulfillmentType: 'delivery',
      deliveryAddress: 'Flat 402, Green Meadows, 24 Elm Avenue',
      paymentMethod: 'upi',
      status: 'Completed',
      items: [
        { id: 'pa-2', name: 'Almond Croissant', price: 160, quantity: 2 },
        { id: 'co-3', name: 'Cappuccino', price: 160, quantity: 2 }
      ],
      subtotal: 640,
      packagingFee: 25,
      total: 665,
      notes: 'Extra hot cappuccino please.'
    }
  ],

  reservations: [
    {
      id: 'RES-401',
      name: 'Rohan Deshmukh',
      phone: '+91 98334 55667',
      email: 'rohan.d@example.com',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: '10:30 AM',
      guests: 2,
      occasion: 'Breakfast Meeting',
      specialRequests: 'Window seat if available.',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    }
  ],

  reviews: [
    {
      id: 'rev-1',
      author: 'Ananya Roy',
      rating: 5,
      title: 'The best sourdough in the city',
      comment: 'The crust on their Country Sourdough has that authentic crackle and the crumb is heavenly. You can taste the slow fermentation.',
      date: '2 days ago',
      verified: true
    },
    {
      id: 'rev-2',
      author: 'Kabir Singhania',
      rating: 5,
      title: 'Flaky perfection every morning',
      comment: 'The almond croissant with a fresh flat white is my weekend ritual. Warm, inviting atmosphere and friendly bakers.',
      date: '1 week ago',
      verified: true
    },
    {
      id: 'rev-3',
      author: 'Dr. Meera Nambiar',
      rating: 5,
      title: 'Real artisanal craftsmanship',
      comment: 'No shortcuts, no additives. It is rare to find a bakery that still honors traditional levain techniques like Hearth & Grain.',
      date: '2 weeks ago',
      verified: true
    }
  ],

  contactMessages: [],
  subscribers: ['hello@artisanfoodie.com', 'breadlover@gmail.com']
};

export function initDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
  }
}

export function readDb() {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return INITIAL_DATA;
  }
}

export function writeDb(data) {
  initDb();
  const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

export function generateId(prefix = 'item') {
  return `${prefix}-${crypto.randomBytes(3).toString('hex')}`;
}

export function generateOrderNumber() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `HG-${randomNum}`;
}
