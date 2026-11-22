import { initializeApp } from 'firebase/app'
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDsqUzWj16SyaZooYR8ITVxG449gxha7iQ",
  authDomain: "profix-845c1.firebaseapp.com",
  projectId: "profix-845c1",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const targetEmail = process.argv[2]

if (!targetEmail) {
  console.log("Usage: node firebase/seed/makeAdmin.js <user-email>")
  console.log("Example: node firebase/seed/makeAdmin.js admin@example.com")
  process.exit(1)
}

async function promoteToAdmin() {
  console.log(`Searching for account with email: ${targetEmail}...`)
  const q = query(collection(db, 'users'), where('email', '==', targetEmail))
  const snap = await getDocs(q)

  if (snap.empty) {
    console.error(`No user found with email "${targetEmail}". Please register on the website first!`)
    process.exit(1)
  }

  for (const userDoc of snap.docs) {
    const userRef = doc(db, 'users', userDoc.id)
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date().toISOString(),
    })
    console.log(`Success! User "${userDoc.data().fullName}" (${targetEmail}) is now an Administrator!`)
    console.log(`UID: ${userDoc.id}`)
  }

  console.log("\nYou can now sign in at http://localhost:5173/login and access the Admin Panel.")
}

promoteToAdmin().catch(console.error)
