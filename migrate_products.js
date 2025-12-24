const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

// convert undefined → null
const safe = (v) => (v === undefined ? null : v);

mongoose.connect('mongodb://localhost:27017/e-com');

const Product = mongoose.model(
  'Product',
  new mongoose.Schema({}, { strict: false }),
  'products'
);

(async () => {
  const sql = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecom_mysql'
  });

  const products = await Product.find();

  for (const p of products) {

    // ---------------- PRODUCTS ----------------
    await sql.execute(
      `INSERT IGNORE INTO products
      (id, name, description, brand, category, price, rating, num_reviews,
       count_in_stock, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p._id.toString(),
        safe(p.name),
        safe(p.description),
        safe(p.brand),
        safe(p.category),
        safe(p.price),
        safe(p.rating),
        safe(p.numReviews),
        safe(p.countInStock),
        safe(p.user?.toString()),
        safe(p.createdAt),
        safe(p.updatedAt)
      ]
    );

    // ---------------- IMAGES ----------------
    for (const img of p.images || []) {
      await sql.execute(
        `INSERT INTO product_images (product_id, image_path)
         VALUES (?, ?)`,
        [p._id.toString(), safe(img)]
      );
    }

    // ---------------- HIGHLIGHTS (FIXED) ----------------
    // ---------------- HIGHLIGHTS (FINAL FIX) ----------------
let highlights = [];

if (Array.isArray(p.highlights)) {
  highlights = p.highlights;
} else if (typeof p.highlights === 'string') {
  highlights = p.highlights.split(','); // or split('|') if needed
}

for (const h of highlights) {
  let highlightText = null;

  if (typeof h === 'string') {
    highlightText = h.trim();
  } else if (typeof h === 'object' && h !== null) {
    highlightText = h.text || h.label || h.value || null;
  }

  if (highlightText) {
    await sql.execute(
      `INSERT INTO product_highlights (product_id, highlight)
       VALUES (?, ?)`,
      [p._id.toString(), highlightText]
    );
  }
}

  }
console.log('Sample highlights:', products[0].highlights);

  console.log('✅ PRODUCTS migrated');
  process.exit();
})();
