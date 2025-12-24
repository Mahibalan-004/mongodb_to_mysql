CREATE TABLE users (
  id VARCHAR(24) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  is_admin BOOLEAN DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE products (
  id VARCHAR(24) PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  brand VARCHAR(100),
  category VARCHAR(100),
  price DECIMAL(10,2),
  rating INT,
  num_reviews INT,
  count_in_stock INT,
  user_id VARCHAR(24),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(24),
  image_path VARCHAR(255),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE product_highlights (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(24),
  highlight TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
  id VARCHAR(24) PRIMARY KEY,
  user_id VARCHAR(24),
  total_price DECIMAL(10,2),
  tax_price DECIMAL(10,2),
  shipping_price DECIMAL(10,2),
  payment_method VARCHAR(50),
  is_paid BOOLEAN,
  paid_at DATETIME,
  is_delivered BOOLEAN,
  delivered_at DATETIME,
  payment_status VARCHAR(50),
  tracking_id VARCHAR(100),
  tracking_status VARCHAR(50),
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(24),
  product_id VARCHAR(24),
  name VARCHAR(255),
  qty INT,
  price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);


CREATE TABLE shipping_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(24),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);


CREATE TABLE tracking_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(24),
  status VARCHAR(100),
  updated_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);


