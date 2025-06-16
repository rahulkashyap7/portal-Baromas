const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('baromas.db');

console.log('Checking tents table...');

db.all('SELECT * FROM tents', (err, tents) => {
    if (err) {
        console.error('Error fetching tents:', err);
    } else {
        console.log('Tents in database:', tents);
        console.log('Total tents:', tents.length);
    }
    db.close();
}); 