import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore'

// Use environment or default credentials
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDsqUzWj16SyaZooYR8ITVxG449gxha7iQ",
  authDomain: "profix-845c1.firebaseapp.com",
  projectId: "profix-845c1",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const defaultCategories = [
  {
    id: "plumbing",
    name: "Plumbing Services",
    description: "Pipe repairs, leak detection, drain cleaning, tap installations and bathroom fittings.",
    isActive: true,
  },
  {
    id: "electrical",
    name: "Electrical Services",
    description: "Wiring, circuit breaker repair, fan and light installations, switchboard repairs, and safety audits.",
    isActive: true,
  },
  {
    id: "heating-water",
    name: "Water Heater & Geyser",
    description: "Instant and storage geyser installation, repair, thermostat replacement and maintenance.",
    isActive: true,
  },
  {
    id: "emergency-leak",
    name: "Emergency Burst Pipe Repair",
    description: "24/7 urgent response for water leaks, burst mains, and pipe emergencies.",
    isActive: true,
  }
]

async function seed() {
  console.log("Seeding service categories...")
  const now = new Date().toISOString()

  for (const cat of defaultCategories) {
    const docRef = doc(db, "serviceCategories", cat.id)
    await setDoc(docRef, {
      ...cat,
      createdAt: now,
      updatedAt: now,
    }, { merge: true })
    console.log(`- Seeded category: ${cat.name}`)
  }

  console.log("Seeding complete!")
}

seed().catch(console.error)
