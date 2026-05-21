import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Since we are in the same project, we can often just use application default or explicit config
// However, for firebase-admin we usually need a service account.
// In AI Studio, we can often skip explicit auth if the environment is set up.
// Let's try simple init.

const app = initializeApp({
  projectId: config.projectId
});

const db = getFirestore(app, config.firestoreDatabaseId);

const stalls = [
  {
    name: "Campus Bytes",
    description: "Digital snacks for coding fuel",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400",
    category: "Snacks",
    is_open: true,
    rating: 4.8,
    total_ratings: 120,
    owner_id: "system",
    created_at: new Date().toISOString()
  },
  {
    name: "Polangui Eats",
    description: "Authentic Bicolano flavors",
    image_url: "https://images.unsplash.com/photo-1540333563391-645ccca196ca?q=80&w=400",
    category: "Rice Meals",
    is_open: true,
    rating: 4.9,
    total_ratings: 250,
    owner_id: "system",
    created_at: new Date().toISOString()
  }
];

const menuItems = [
  {
    stall_name: "Campus Bytes",
    items: [
      { name: "Binary Burger", description: "Double patty with 1s and 0s of flavor", price: 65, category: "Snacks", is_available: true, popularity: 45 },
      { name: "Coffee Script", description: "Hot brewed coffee to keep you awake", price: 35, category: "Drinks", is_available: true, popularity: 89 }
    ]
  },
  {
    stall_name: "Polangui Eats",
    items: [
      { name: "Bicol Express", description: "Spicy pork with coconut milk", price: 85, category: "Rice Meals", is_available: true, popularity: 120 },
      { name: "Laing Special", description: "Dried taro leaves in gata", price: 75, category: "Rice Meals", is_available: true, popularity: 95 }
    ]
  }
];

async function seed() {
  console.log("Starting seed...");
  for (const s of stalls) {
    const stallRef = await db.collection('stalls').add(s);
    const itemSet = menuItems.find(mi => mi.stall_name === s.name);
    if (itemSet) {
      for (const item of itemSet.items) {
        await db.collection('menu_items').add({
          ...item,
          stall_id: stallRef.id,
          created_at: new Date().toISOString()
        });
      }
    }
  }
  console.log("Seed completed!");
}

seed().catch(console.error);
