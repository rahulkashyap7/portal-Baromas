# Database Setup for Baromas Booking System

## Option 1: SQLite Database (Recommended for Small Scale)

### Setup Instructions

1. **Install SQLite** (if not already installed)
   ```bash
   # Windows (using chocolatey)
   choco install sqlite
   
   # Or download from https://www.sqlite.org/download.html
   ```

2. **Create Database Schema**
   ```sql
   -- Create the database
   CREATE TABLE bookings (
       id TEXT PRIMARY KEY,
       tent_id TEXT NOT NULL,
       tent_name TEXT NOT NULL,
       check_in DATE NOT NULL,
       check_out DATE NOT NULL,
       guests INTEGER NOT NULL,
       customer_name TEXT NOT NULL,
       customer_phone TEXT NOT NULL,
       customer_email TEXT NOT NULL,
       customer_address TEXT,
       special_requests TEXT,
       total_amount DECIMAL(10,2) NOT NULL,
       advance_amount DECIMAL(10,2) NOT NULL,
       status TEXT DEFAULT 'confirmed',
       payment_id TEXT,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   -- Create indexes for better performance
   CREATE INDEX idx_bookings_tent_id ON bookings(tent_id);
   CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
   CREATE INDEX idx_bookings_status ON bookings(status);
   ```

3. **Update booking-system.js to use SQLite**
   ```javascript
   // Add this to booking-system.js
   const sqlite3 = require('sqlite3').verbose();
   const db = new sqlite3.Database('./baromas_bookings.db');

   // Replace localStorage methods with database calls
   async loadBookings() {
       return new Promise((resolve, reject) => {
           db.all("SELECT * FROM bookings ORDER BY created_at DESC", (err, rows) => {
               if (err) reject(err);
               else resolve(rows || []);
           });
       });
   }

   async saveBooking(booking) {
       return new Promise((resolve, reject) => {
           const stmt = db.prepare(`
               INSERT INTO bookings 
               (id, tent_id, tent_name, check_in, check_out, guests, 
                customer_name, customer_phone, customer_email, customer_address, 
                special_requests, total_amount, advance_amount, status, payment_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           `);
           stmt.run([
               booking.id, booking.tentId, booking.tentName, booking.checkIn, 
               booking.checkOut, booking.guests, booking.customerInfo.name,
               booking.customerInfo.phone, booking.customerInfo.email,
               booking.customerInfo.address || '', booking.customerInfo.specialRequests || '',
               booking.totalAmount, booking.advanceAmount, booking.status, booking.paymentId
           ], (err) => {
               if (err) reject(err);
               else resolve();
           });
       });
   }
   ```

## Option 2: Firebase Firestore (Recommended for Easy Setup)

### Setup Instructions

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Create a new project
   - Enable Firestore Database

2. **Add Firebase to your project**
   ```html
   <!-- Add to index.html head section -->
   <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-app.js"></script>
   <script src="https://www.gstatic.com/firebasejs/9.x.x/firebase-firestore.js"></script>
   ```

3. **Initialize Firebase**
   ```javascript
   // Add to booking-system.js
   const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
   };

   firebase.initializeApp(firebaseConfig);
   const db = firebase.firestore();

   // Replace localStorage methods
   async loadBookings() {
       const snapshot = await db.collection('bookings').orderBy('createdAt', 'desc').get();
       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   }

   async saveBooking(booking) {
       await db.collection('bookings').doc(booking.id).set(booking);
   }
   ```

## Option 3: JSON File Database (Simple Local Storage)

### Setup Instructions

1. **Create a simple JSON file database**
   ```javascript
   // Add to booking-system.js
   const fs = require('fs');
   const path = require('path');

   const DB_FILE = './bookings.json';

   loadBookings() {
       try {
           if (fs.existsSync(DB_FILE)) {
               const data = fs.readFileSync(DB_FILE, 'utf8');
               return JSON.parse(data);
           }
           return [];
       } catch (error) {
           console.error('Error loading bookings:', error);
           return [];
       }
   }

   saveBookings() {
       try {
           fs.writeFileSync(DB_FILE, JSON.stringify(this.bookings, null, 2));
       } catch (error) {
           console.error('Error saving bookings:', error);
       }
   }
   ```

## Current Implementation (localStorage)

The current system uses localStorage which is perfect for:
- Development and testing
- Small number of bookings
- Single-user scenarios

### Advantages:
- No setup required
- Works immediately
- No server needed

### Limitations:
- Data is stored locally (not shared across devices)
- Limited storage space
- Data can be lost if browser data is cleared

## Recommendation

For your current needs, I recommend:

1. **Start with localStorage** (current implementation) for testing
2. **Move to Firebase Firestore** when ready for production
3. **Consider SQLite** if you want full control and don't mind server setup

## Migration Guide

When you're ready to move from localStorage to a proper database:

1. Export current data:
   ```javascript
   const currentBookings = JSON.parse(localStorage.getItem('baromas_bookings') || '[]');
   console.log(JSON.stringify(currentBookings, null, 2));
   ```

2. Import to new database using the setup instructions above

3. Update the booking-system.js file to use the new database methods

## Backup Strategy

Regardless of which database you choose:

1. **Regular backups** (daily/weekly)
2. **Export to CSV** for reporting
3. **Cloud backup** for important data
4. **Test restore procedures** regularly

---

**Note**: The current localStorage implementation is working perfectly for your needs. You can upgrade to a proper database when you have more bookings or need multi-user access. 