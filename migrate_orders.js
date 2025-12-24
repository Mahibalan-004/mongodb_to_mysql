// migrate_orders.js
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');

// 🔥 IMPORTANT: convert undefined → null
const safe = (v) => (v === undefined ? null : v);

mongoose.connect('mongodb://localhost:27017/e-com');

const Order = mongoose.model(
  'Order',
  new mongoose.Schema({}, { strict: false }),
  'orders'
);

(async () => {
  const sql = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecom_mysql'
  });

  const orders = await Order.find();

  for (const o of orders) {
    // ---------------- ORDERS ----------------
    await sql.execute(
      `INSERT IGNORE INTO orders
      (id, user_id, total_price, tax_price, shipping_price,
       payment_method, is_paid, paid_at, is_delivered, delivered_at,
       payment_status, tracking_id, tracking_status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o._id.toString(),
        safe(o.user?.toString()),
        safe(o.totalPrice),
        safe(o.taxPrice),
        safe(o.shippingPrice),
        safe(o.paymentMethod),
        o.isPaid ? 1 : 0,
        safe(o.paidAt),
        o.isDelivered ? 1 : 0,
        safe(o.deliveredAt),
        safe(o.paymentStatus),
        safe(o.trackingId),
        safe(o.trackingStatus),
        safe(o.createdAt),
        safe(o.updatedAt)
      ]
    );

    // ---------------- ORDER ITEMS ----------------
    for (const item of o.orderItems || []) {
      await sql.execute(
        `INSERT INTO order_items
         (order_id, product_id, name, qty, price)
         VALUES (?, ?, ?, ?, ?)`,
        [
          o._id.toString(),
          safe(item.product?.toString()),
          safe(item.name),
          safe(item.qty),
          safe(item.price)
        ]
      );
    }

    // ---------------- SHIPPING ADDRESS ----------------
    if (o.shippingAddress) {
      await sql.execute(
        `INSERT INTO shipping_addresses
         (order_id, address, city, postal_code, country)
         VALUES (?, ?, ?, ?, ?)`,
        [
          o._id.toString(),
          safe(o.shippingAddress.address),
          safe(o.shippingAddress.city),
          safe(o.shippingAddress.postalCode),
          safe(o.shippingAddress.country)
        ]
      );
    }

    // ---------------- TRACKING HISTORY ----------------
    for (const t of o.trackingHistory || []) {
      await sql.execute(
        `INSERT INTO tracking_history
         (order_id, status, updated_at)
         VALUES (?, ?, ?)`,
        [
          o._id.toString(),
          safe(t.status),
          safe(t.updatedAt)
        ]
      );
    }
  }

  console.log('✅ ORDERS migrated');
  process.exit();
})();
