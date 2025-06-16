# Database Query Reference for Baromas Booking System

## 🚀 Quick Access Commands

### Start SQLite CLI
```bash
sqlite3 baromas_bookings.db
```

### Exit SQLite CLI
```sql
.quit
```

---

## 📊 View Data

### View All Tables
```sql
.tables
```

### View Table Structure
```sql
.schema bookings
.schema tents
```

### View All Bookings
```sql
SELECT * FROM bookings;
```

### View All Tents
```sql
SELECT * FROM tents;
```

---

## 🔍 Common Queries

### Recent Bookings (Last 10)
```sql
SELECT 
    id, 
    customer_name, 
    tent_name, 
    check_in, 
    check_out, 
    status,
    created_at
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;
```

### Today's Bookings
```sql
SELECT * FROM bookings 
WHERE DATE(check_in) = DATE('now');
```

### This Month's Revenue
```sql
SELECT 
    SUM(advance_amount) as monthly_revenue,
    COUNT(*) as total_bookings
FROM bookings 
WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now');
```

### Bookings by Status
```sql
SELECT 
    status,
    COUNT(*) as count,
    SUM(advance_amount) as revenue
FROM bookings 
GROUP BY status;
```

### Most Popular Tents
```sql
SELECT 
    tent_name,
    COUNT(*) as booking_count,
    SUM(advance_amount) as total_revenue
FROM bookings 
GROUP BY tent_name 
ORDER BY booking_count DESC;
```

### Customer Contact List
```sql
SELECT 
    customer_name,
    customer_phone,
    customer_email,
    COUNT(*) as total_bookings
FROM bookings 
GROUP BY customer_phone 
ORDER BY total_bookings DESC;
```

---

## 📈 Statistics Queries

### Overall Statistics
```sql
SELECT 
    COUNT(*) as total_bookings,
    SUM(advance_amount) as total_revenue,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
FROM bookings;
```

### Monthly Statistics
```sql
SELECT 
    strftime('%Y-%m', created_at) as month,
    COUNT(*) as bookings,
    SUM(advance_amount) as revenue
FROM bookings 
GROUP BY month 
ORDER BY month DESC;
```

### Revenue by Tent
```sql
SELECT 
    tent_name,
    COUNT(*) as bookings,
    SUM(advance_amount) as revenue,
    AVG(advance_amount) as avg_advance
FROM bookings 
GROUP BY tent_name 
ORDER BY revenue DESC;
```

---

## 🔧 Management Queries

### Delete Test Bookings
```sql
DELETE FROM bookings WHERE customer_name LIKE '%test%';
```

### Update Booking Status
```sql
UPDATE bookings 
SET status = 'confirmed' 
WHERE id = 'BRM250616001';
```

### Find Duplicate Bookings
```sql
SELECT 
    tent_id, 
    check_in, 
    check_out, 
    COUNT(*) as duplicates
FROM bookings 
GROUP BY tent_id, check_in, check_out 
HAVING COUNT(*) > 1;
```

### Backup Database
```bash
# In terminal (not SQLite)
cp baromas_bookings.db backup_$(date +%Y%m%d).db
```

### Export Data to CSV
```sql
.mode csv
.headers on
.output bookings_export.csv
SELECT * FROM bookings;
.output stdout
```

---

## 🛠️ Troubleshooting

### Check Database Integrity
```sql
PRAGMA integrity_check;
```

### View Database Info
```sql
PRAGMA database_list;
```

### Check Table Sizes
```sql
SELECT 
    name,
    sqlite_compileoption_used('ENABLE_JSON1') as json_support
FROM sqlite_master 
WHERE type='table';
```

---

## 📱 API Access (Alternative to SQLite CLI)

### Get All Data via API
```bash
# Get tents
curl http://localhost:3000/api/tents

# Get bookings
curl http://localhost:3000/api/bookings

# Get stats
curl http://localhost:3000/api/stats

# Export CSV
curl http://localhost:3000/api/bookings/export -o bookings.csv
```

### Filter Bookings via API
```bash
# Get confirmed bookings
curl "http://localhost:3000/api/bookings?status=confirmed"

# Get bookings for specific tent
curl "http://localhost:3000/api/bookings?tent_id=triveni-1"

# Get bookings from date range
curl "http://localhost:3000/api/bookings?from_date=2025-01-01&to_date=2025-12-31"
```

---

## 🎯 Quick Tips

1. **Always backup before major changes**
2. **Use `.mode column` for better formatting**
3. **Use `.headers on` to show column names**
4. **Use `LIMIT 10` to avoid overwhelming output**
5. **Use the admin panel for daily operations**
6. **Use SQLite CLI for advanced queries**
7. **Use API for programmatic access** 