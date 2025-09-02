const db = require("./db");

async function test() {
  try {
    const res = await db.raw("SELECT NOW()");
    console.log("Connected to Neon:", res.rows[0]);
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    process.exit();
  }
}

test();
