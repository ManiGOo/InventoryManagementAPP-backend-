exports.seed = async function (knex) {
  // Clear existing items
  await knex("items").del();

  await knex("items").insert([
    // Electronics
    {
      name: "Smartphone",
      description: "Latest model smartphone with 128GB storage",
      price: 699.99,
      image_url: "/uploads/smartphone.jpg",
      category_id: 1, // Electronics
      user_id: 1,
    },
    {
      name: "Laptop",
      description: "15-inch laptop with 16GB RAM",
      price: 1199.99,
      image_url: "/uploads/laptop.jpg",
      category_id: 1,
      user_id: 1,
    },

    // Clothing
    {
      name: "T-Shirt",
      description: "100% cotton casual t-shirt",
      price: 19.99,
      image_url: "/uploads/tshirt.jpg",
      category_id: 2, // Clothing
      user_id: 1,
    },
    {
      name: "Jeans",
      description: "Slim-fit denim jeans",
      price: 49.99,
      image_url: "/uploads/jeans.jpg",
      category_id: 2,
      user_id: 1,
    },

    // Furniture
    {
      name: "Office Chair",
      description: "Ergonomic chair with lumbar support",
      price: 149.99,
      image_url: "/uploads/chair.jpg",
      category_id: 3, // Furniture
      user_id: 1,
    },
    {
      name: "Dining Table",
      description: "Wooden dining table for six",
      price: 399.99,
      image_url: "/uploads/table.jpg",
      category_id: 3,
      user_id: 1,
    },

    // Books
    {
      name: "JavaScript Guide",
      description: "Comprehensive book on modern JavaScript",
      price: 29.99,
      image_url: "/uploads/jsbook.jpg",
      category_id: 4, // Books
      user_id: 1,
    },
    {
      name: "Database Systems",
      description: "Introductory book on databases",
      price: 59.99,
      image_url: "/uploads/dbbook.jpg",
      category_id: 4,
      user_id: 1,
    },

    // Sports
    {
      name: "Football",
      description: "Standard size 5 football",
      price: 25.99,
      image_url: "/uploads/football.jpg",
      category_id: 5, // Sports
      user_id: 1,
    },
    {
      name: "Tennis Racket",
      description: "Lightweight graphite tennis racket",
      price: 89.99,
      image_url: "/uploads/racket.jpg",
      category_id: 5,
      user_id: 1,
    },

    // Food & Beverages
    {
      name: "Water Bottle",
      description: "1-liter stainless steel reusable bottle",
      price: 15.99,
      image_url: "/uploads/bottle.jpg",
      category_id: 6, // Food & Beverages
      user_id: 1,
    },
    {
      name: "Coffee Pack",
      description: "500g premium roasted coffee beans",
      price: 12.99,
      image_url: "/uploads/coffee.jpg",
      category_id: 6,
      user_id: 1,
    },
  ]);
};
