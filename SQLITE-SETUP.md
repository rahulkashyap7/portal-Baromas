# SQLite Database Setup for Baromas Booking System

## 🚀 Quick Start Guide

### Step 1: Install Node.js
1. Download and install Node.js from [https://nodejs.org/](https://nodejs.org/)
2. Verify installation: `node --version` and `npm --version`

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Initialize Database
```bash
npm run init-db
```

### Step 4: Start the Server
```bash
npm start
```

### Step 5: Access Your Website
- **Main Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Base**: http://localhost:3000/api

---

## 📁 File Structure

```
Baromas-Booking-Portal/
├── package.json              # Node.js dependencies
├── server.js                 # Express server with API endpoints
├── init-database.js          # Database initialization script
├── booking-system-api.js     # Frontend booking system (API version)
├── admin-api.js              # Admin panel (API version)
├── index.html                # Main website
├── admin.html                # Admin panel
├── booking-form.js           # Booking form
├── style.css                 # Styling
├── baromas_bookings.db       # SQLite database file (created automatically)
└── SQLITE-SETUP.md           # This guide
```

---

## 🔧 Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,                    -- Booking ID (e.g., BRM250616001)
    tent_id TEXT NOT NULL,                  -- Tent identifier
    tent_name TEXT NOT NULL,                -- Tent display name
    check_in DATE NOT NULL,                 -- Check-in date
    check_out DATE NOT NULL,                -- Check-out date
    guests INTEGER NOT NULL,                -- Number of guests
    customer_name TEXT NOT NULL,            -- Customer full name
    customer_phone TEXT NOT NULL,           -- Customer phone number
    customer_email TEXT NOT NULL,           -- Customer email
    customer_address TEXT,                  -- Customer address (optional)
    special_requests TEXT,                  -- Special requests (optional)
    total_amount DECIMAL(10,2) NOT NULL,    -- Total booking amount
    advance_amount DECIMAL(10,2) NOT NULL,  -- Advance payment amount
    status TEXT DEFAULT 'confirmed',        -- Booking status
    payment_id TEXT,                        -- Payment gateway ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tents Table
```sql
CREATE TABLE tents (
    id TEXT PRIMARY KEY,                    -- Tent identifier
    name TEXT NOT NULL,                     -- Tent display name
    price DECIMAL(10,2) NOT NULL,           -- Price per night
    max_guests INTEGER NOT NULL,            -- Maximum guests allowed
    description TEXT,                       -- Tent description
    amenities TEXT,                         -- JSON array of amenities
    status TEXT DEFAULT 'active',           -- Tent status
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 API Endpoints

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/:id` - Get specific booking
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status

### Tents
- `GET /api/tents` - Get all tents

### Availability
- `GET /api/availability` - Check tent availability

### Statistics
- `GET /api/stats` - Get booking statistics

### Export
- `GET /api/bookings/export` - Export bookings to CSV

---

## 🔄 Migration from localStorage

### Option 1: Automatic Migration
The system will automatically work with the new database. No migration needed!

### Option 2: Manual Migration (if you have existing localStorage data)
```javascript
// In browser console, export existing data:
const existingBookings = JSON.parse(localStorage.getItem('baromas_bookings') || '[]');
console.log(JSON.stringify(existingBookings, null, 2));

// Then manually insert into database using the API:
existingBookings.forEach(async (booking) => {
    await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: booking.id,
            tent_id: booking.tentId,
            tent_name: booking.tentName,
            check_in: booking.checkIn,
            check_out: booking.checkOut,
            guests: booking.guests,
            customer_name: booking.customerInfo.name,
            customer_phone: booking.customerInfo.phone,
            customer_email: booking.customerInfo.email,
            customer_address: booking.customerInfo.address || '',
            special_requests: booking.customerInfo.specialRequests || '',
            total_amount: booking.totalAmount,
            advance_amount: booking.advanceAmount,
            payment_id: booking.paymentId
        })
    });
});
```

---

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start server (production)
npm start

# Start server (development with auto-reload)
npm run dev

# View database in SQLite browser (optional)
# Download DB Browser for SQLite from https://sqlitebrowser.org/
# Open baromas_bookings.db file
```

---

## 🔍 Database Management

### View Database Contents
```bash
# Using SQLite command line
sqlite3 baromas_bookings.db

# View all bookings
SELECT * FROM bookings;

# View all tents
SELECT * FROM tents;

# View booking statistics
SELECT 
    COUNT(*) as total_bookings,
    SUM(advance_amount) as total_revenue,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings
FROM bookings;
```

### Backup Database
```bash
# Create backup
cp baromas_bookings.db baromas_bookings_backup_$(date +%Y%m%d).db

# Or use SQLite dump
sqlite3 baromas_bookings.db .dump > backup_$(date +%Y%m%d).sql
```

### Reset Database
```bash
# Delete and recreate
rm baromas_bookings.db
npm run init-db
```

---

## 🔧 Configuration

### Change Server Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

### Change API Base URL
Edit `booking-system-api.js` and `admin-api.js`:
```javascript
this.apiBase = 'http://localhost:3000/api'; // Change to your server URL
```

### Environment Variables
Create `.env` file (optional):
```env
PORT=3000
NODE_ENV=production
```

---

## 🚀 Production Deployment

### 1. Prepare for Production
```bash
# Install production dependencies only
npm install --production

# Set environment variables
export NODE_ENV=production
export PORT=3000
```

### 2. Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "baromas-booking"

# Monitor
pm2 status
pm2 logs baromas-booking

# Auto-restart on server reboot
pm2 startup
pm2 save
```

### 3. Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### 4. Using Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 Security Considerations

### 1. Database Security
- Keep `baromas_bookings.db` file secure
- Regular backups
- Use environment variables for sensitive data

### 2. API Security
- Add authentication for admin endpoints
- Rate limiting
- Input validation
- CORS configuration

### 3. Production Checklist
- [ ] Use HTTPS
- [ ] Set up proper CORS
- [ ] Add input validation
- [ ] Implement rate limiting
- [ ] Set up monitoring
- [ ] Regular backups
- [ ] Error logging

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "Port 3000 already in use"
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### 2. "Database locked" error
```bash
# Check if another process is using the database
# Restart the server
npm start
```

#### 3. "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. API connection errors
- Check if server is running: `http://localhost:3000/api/tents`
- Verify CORS settings in `server.js`
- Check browser console for errors

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm start

# Or add to server.js
console.log('Debug info:', someVariable);
```

---

## 📞 Support

If you encounter any issues:

1. Check the console logs in browser (F12)
2. Check server logs in terminal
3. Verify database file exists: `ls -la baromas_bookings.db`
4. Test API endpoints: `curl http://localhost:3000/api/tents`

---

## 🎉 Success!

Your Baromas Booking System is now running with a proper SQLite database! 

- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Database**: `baromas_bookings.db`

The system will automatically:
- ✅ Store all bookings in SQLite database
- ✅ Provide real-time availability checking
- ✅ Generate booking statistics
- ✅ Export data to CSV
- ✅ Handle multiple concurrent users
- ✅ Provide backup and restore capabilities 