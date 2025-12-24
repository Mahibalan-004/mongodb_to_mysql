// migrate_users.js
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

mongoose.connect('mongodb://localhost:27017/e-com');

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

(async () => {
  const sql = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecom_mysql'
  });

  const users = await User.find();

  for (const u of users) {
    await sql.execute(
      `INSERT IGNORE INTO users 
       (id, name, email, password, is_admin, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        u._id.toString(),
        u.name,
        u.email,
        u.password,
        u.isAdmin ? 1 : 0,
        u.createdAt,
        u.updatedAt
      ]
    );
  }

  console.log('✅ USERS migrated');
  process.exit();
})();
