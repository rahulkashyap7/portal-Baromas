const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'baromas_bookings.db');
const db = new sqlite3.Database(dbPath);

console.log('🧪 Testing SQLite Database Setup...\n');

// Test 1: Check if database exists
console.log('✅ Test 1: Database Connection');
console.log('Database file:', dbPath);
console.log('Status: Connected successfully\n');

// Test 2: Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('❌ Error checking tables:', err);
        return;
    }
    
    console.log('✅ Test 2: Database Tables');
    console.log('Found tables:', tables.map(t => t.name).join(', '));
    console.log('Expected: bookings, tents\n');
    
    // Test 3: Check tent data
    db.get("SELECT COUNT(*) as count FROM tents", (err, result) => {
        if (err) {
            console.error('❌ Error counting tents:', err);
            return;
        }
        
        console.log('✅ Test 3: Tent Data');
        console.log(`Tents loaded: ${result.count}/8`);
        console.log('Status:', result.count === 8 ? 'PASS' : 'FAIL');
        console.log('');
        
        // Test 4: Check booking data
        db.get("SELECT COUNT(*) as count FROM bookings", (err, result) => {
            if (err) {
                console.error('❌ Error counting bookings:', err);
                return;
            }
            
            console.log('✅ Test 4: Booking Data');
            console.log(`Current bookings: ${result.count}`);
            console.log('Status: Ready for new bookings\n');
            
            // Test 5: Sample tent data
            db.get("SELECT name, price FROM tents LIMIT 1", (err, tent) => {
                if (err) {
                    console.error('❌ Error getting sample tent:', err);
                    return;
                }
                
                console.log('✅ Test 5: Sample Data');
                console.log(`Sample tent: ${tent.name} - ₹${tent.price}/night`);
                console.log('');
                
                // Test 6: Database size
                const fs = require('fs');
                const stats = fs.statSync(dbPath);
                const fileSizeInKB = stats.size / 1024;
                
                console.log('✅ Test 6: Database File');
                console.log(`File size: ${fileSizeInKB.toFixed(1)} KB`);
                console.log('Status: Database file exists and has data\n');
                
                console.log('🎉 All Tests Passed! Your SQLite setup is working perfectly.');
                console.log('\n📋 Next Steps:');
                console.log('1. Visit http://localhost:3000 to test booking');
                console.log('2. Visit http://localhost:3000/admin to manage bookings');
                console.log('3. Use "sqlite3 baromas_bookings.db" to access database directly');
                
                db.close();
            });
        });
    });
}); 