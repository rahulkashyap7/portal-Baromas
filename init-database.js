const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file
const dbPath = path.join(__dirname, 'baromas_bookings.db');
const db = new sqlite3.Database(dbPath);

console.log('Initializing Baromas Booking Database...');

// Create tables
db.serialize(() => {
    // Create bookings table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating bookings table:', err);
        } else {
            console.log('✓ Bookings table created successfully');
        }
    });

    // Create tents table
    db.run(`
        CREATE TABLE IF NOT EXISTS tents (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            max_guests INTEGER NOT NULL,
            description TEXT,
            amenities TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating tents table:', err);
        } else {
            console.log('✓ Tents table created successfully');
        }
    });

    // Insert default tent data
    const tents = [
        {
            id: 'triveni-1',
            name: 'Triveni Tent 1',
            price: 149,
            max_guests: 2,
            description: 'Luxurious tent with panoramic mountain views, perfect for couples seeking a romantic getaway.',
            amenities: JSON.stringify(['Private deck with mountain views', 'En-suite bathroom', 'King bed', 'Wi-Fi', 'Air conditioning'])
        },
        {
            id: 'triveni-2',
            name: 'Triveni Tent 2',
            price: 139,
            max_guests: 2,
            description: 'Elegant tent with a private deck overlooking the forest, ideal for nature enthusiasts.',
            amenities: JSON.stringify(['Private deck with forest views', 'En-suite bathroom', 'Queen bed', 'Wi-Fi', 'Air conditioning'])
        },
        {
            id: 'triveni-3',
            name: 'Triveni Tent 3',
            price: 159,
            max_guests: 3,
            description: 'Spacious tent with a private balcony offering stunning lake views and premium amenities.',
            amenities: JSON.stringify(['Private balcony with lake views', 'En-suite bathroom', 'King bed', 'Wi-Fi', 'Air conditioning'])
        },
        {
            id: 'panchvati-1',
            name: 'Panchvati Tent 1',
            price: 179,
            max_guests: 4,
            description: 'Family-friendly tent with multiple beds and a garden view, perfect for small families.',
            amenities: JSON.stringify(['Private patio with garden views', 'En-suite bathroom', '2 Queen beds', 'Wi-Fi', 'Air conditioning'])
        },
        {
            id: 'panchvati-2',
            name: 'Panchvati Tent 2',
            price: 169,
            max_guests: 2,
            description: 'Premium glamping experience with a king-sized bed and an outdoor seating area.',
            amenities: JSON.stringify(['Outdoor seating with mountain views', 'En-suite bathroom', 'King bed', 'Wi-Fi', 'Air conditioning'])
        },
        {
            id: 'panchvati-3',
            name: 'Panchvati Tent 3',
            price: 199,
            max_guests: 2,
            description: 'Luxurious king-sized bed and a private terrace with panoramic valley views.',
            amenities: JSON.stringify(['Private terrace with valley views', 'En-suite bathroom', 'King bed', 'Wi-Fi', 'Air conditioning'])
        },
        {
            id: 'panchvati-4',
            name: 'Panchvati Tent 4',
            price: 159,
            max_guests: 2,
            description: 'Cozy queen-sized bed and a private dining area with valley views.',
            amenities: JSON.stringify(['Private dining area with valley views', 'En-suite bathroom', 'Queen bed', 'Wi-Fi', 'Air conditioning'])
        },
        {
            id: 'panchvati-5',
            name: 'Panchvati Tent 5',
            price: 189,
            max_guests: 2,
            description: 'King-sized bed and an outdoor shower that allows you to connect with nature.',
            amenities: JSON.stringify(['Private deck with river views', 'Outdoor shower', 'En-suite bathroom', 'King bed', 'Wi-Fi', 'Air conditioning'])
        }
    ];

    // Insert tents
    const insertTent = db.prepare(`
        INSERT OR REPLACE INTO tents (id, name, price, max_guests, description, amenities)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    tents.forEach(tent => {
        insertTent.run([
            tent.id,
            tent.name,
            tent.price,
            tent.max_guests,
            tent.description,
            tent.amenities
        ], (err) => {
            if (err) {
                console.error(`Error inserting tent ${tent.name}:`, err);
            } else {
                console.log(`✓ Tent ${tent.name} inserted successfully`);
            }
        });
    });

    insertTent.finalize();

    // Create indexes for better performance
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_tent_id ON bookings(tent_id)', (err) => {
        if (err) {
            console.error('Error creating tent_id index:', err);
        } else {
            console.log('✓ Tent ID index created');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out)', (err) => {
        if (err) {
            console.error('Error creating dates index:', err);
        } else {
            console.log('✓ Dates index created');
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)', (err) => {
        if (err) {
            console.error('Error creating status index:', err);
        } else {
            console.log('✓ Status index created');
        }
    });
});

// Close database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err);
    } else {
        console.log('✓ Database initialized successfully!');
        console.log('Database file created at:', dbPath);
    }
}); 