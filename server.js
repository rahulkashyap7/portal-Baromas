const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Database connection
const dbPath = path.join(__dirname, 'baromas_bookings.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('✓ Connected to SQLite database');
    }
});

// API Routes

// Get all tents
app.get('/api/tents', (req, res) => {
    db.all('SELECT * FROM tents WHERE status = "active" ORDER BY name', (err, rows) => {
        if (err) {
            console.error('Error fetching tents:', err);
            res.status(500).json({ error: 'Failed to fetch tents' });
        } else {
            // Parse amenities JSON
            const tents = rows.map(tent => ({
                ...tent,
                amenities: JSON.parse(tent.amenities || '[]')
            }));
            res.json(tents);
        }
    });
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
    const { status, tent_id, from_date, to_date } = req.query;
    
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];
    
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    
    if (tent_id) {
        query += ' AND tent_id = ?';
        params.push(tent_id);
    }
    
    if (from_date) {
        query += ' AND check_in >= ?';
        params.push(from_date);
    }
    
    if (to_date) {
        query += ' AND check_out <= ?';
        params.push(to_date);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching bookings:', err);
            res.status(500).json({ error: 'Failed to fetch bookings' });
        } else {
            res.json(rows);
        }
    });
});

// Get booking by ID
app.get('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching booking:', err);
            res.status(500).json({ error: 'Failed to fetch booking' });
        } else if (!row) {
            res.status(404).json({ error: 'Booking not found' });
        } else {
            res.json(row);
        }
    });
});

// Create new booking
app.post('/api/bookings', (req, res) => {
    const {
        id, tent_id, tent_name, check_in, check_out, guests,
        customer_name, customer_phone, customer_email, customer_address,
        special_requests, total_amount, advance_amount, payment_id
    } = req.body;
    
    const query = `
        INSERT INTO bookings (
            id, tent_id, tent_name, check_in, check_out, guests,
            customer_name, customer_phone, customer_email, customer_address,
            special_requests, total_amount, advance_amount, payment_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
        id, tent_id, tent_name, check_in, check_out, guests,
        customer_name, customer_phone, customer_email, customer_address || '',
        special_requests || '', total_amount, advance_amount, payment_id
    ];
    
    db.run(query, params, function(err) {
        if (err) {
            console.error('Error creating booking:', err);
            res.status(500).json({ error: 'Failed to create booking' });
        } else {
            // Fetch the created booking
            db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, booking) => {
                if (err) {
                    res.status(500).json({ error: 'Booking created but failed to fetch details' });
                } else {
                    res.status(201).json(booking);
                }
            });
        }
    });
});

// Update booking status
app.patch('/api/bookings/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    db.run(
        'UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                console.error('Error updating booking status:', err);
                res.status(500).json({ error: 'Failed to update booking status' });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Booking not found' });
            } else {
                res.json({ message: 'Booking status updated successfully' });
            }
        }
    );
});

// Get booked dates for availability check
app.get('/api/availability', (req, res) => {
    const { check_in, check_out } = req.query;
    
    if (!check_in || !check_out) {
        return res.status(400).json({ error: 'Check-in and check-out dates are required' });
    }
    
    const query = `
        SELECT tent_id, check_in, check_out 
        FROM bookings 
        WHERE status = 'confirmed' 
        AND (
            (check_in < ? AND check_out > ?) OR
            (check_in < ? AND check_out > ?) OR
            (check_in >= ? AND check_out <= ?)
        )
    `;
    
    db.all(query, [check_out, check_in, check_out, check_in, check_in, check_out], (err, rows) => {
        if (err) {
            console.error('Error checking availability:', err);
            res.status(500).json({ error: 'Failed to check availability' });
        } else {
            // Group by tent_id
            const bookedDates = {};
            rows.forEach(row => {
                if (!bookedDates[row.tent_id]) {
                    bookedDates[row.tent_id] = [];
                }
                bookedDates[row.tent_id].push({
                    check_in: row.check_in,
                    check_out: row.check_out
                });
            });
            res.json(bookedDates);
        }
    });
});

// Get booking statistics
app.get('/api/stats', (req, res) => {
    const queries = {
        total_bookings: 'SELECT COUNT(*) as count FROM bookings',
        confirmed_bookings: 'SELECT COUNT(*) as count FROM bookings WHERE status = "confirmed"',
        pending_bookings: 'SELECT COUNT(*) as count FROM bookings WHERE status = "pending"',
        total_revenue: 'SELECT SUM(advance_amount) as total FROM bookings WHERE status = "confirmed"'
    };
    
    const stats = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.entries(queries).forEach(([key, query]) => {
        db.get(query, (err, row) => {
            if (err) {
                console.error(`Error fetching ${key}:`, err);
                stats[key] = 0;
            } else {
                stats[key] = row.count || row.total || 0;
            }
            
            completedQueries++;
            if (completedQueries === totalQueries) {
                res.json(stats);
            }
        });
    });
});

// Export bookings to CSV
app.get('/api/bookings/export', (req, res) => {
    const { status, from_date, to_date } = req.query;
    
    let query = 'SELECT * FROM bookings WHERE 1=1';
    const params = [];
    
    if (status) {
        query += ' AND status = ?';
        params.push(status);
    }
    
    if (from_date) {
        query += ' AND check_in >= ?';
        params.push(from_date);
    }
    
    if (to_date) {
        query += ' AND check_out <= ?';
        params.push(to_date);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error exporting bookings:', err);
            res.status(500).json({ error: 'Failed to export bookings' });
        } else {
            // Convert to CSV
            const csvHeaders = [
                'Booking ID', 'Tent', 'Check-in', 'Check-out', 'Guests',
                'Customer Name', 'Phone', 'Email', 'Address', 'Special Requests',
                'Total Amount', 'Advance Amount', 'Status', 'Payment ID', 'Created At'
            ];
            
            const csvRows = rows.map(row => [
                row.id, row.tent_name, row.check_in, row.check_out, row.guests,
                row.customer_name, row.customer_phone, row.customer_email, row.customer_address,
                row.special_requests, row.total_amount, row.advance_amount, row.status,
                row.payment_id, row.created_at
            ]);
            
            const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map(field => `"${field || ''}"`).join(','))
                .join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
            res.send(csvContent);
        }
    });
});

// Delete all bookings
app.delete('/api/bookings', (req, res) => {
    db.run('DELETE FROM bookings', function(err) {
        if (err) {
            console.error('Error deleting all bookings:', err);
            res.status(500).json({ error: 'Failed to delete bookings' });
        } else {
            res.json({ message: 'All bookings deleted successfully' });
        }
    });
});

// Serve the main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Baromas Booking Server running on port ${PORT}`);
    console.log(`✓ Website: http://localhost:${PORT}`);
    console.log(`✓ Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`✓ API Base URL: http://localhost:${PORT}/api`);
}); 