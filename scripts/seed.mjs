// Creates the admin account, a demo vendor + customer and sample approved services.
// Usage: start the app (npm run dev), then in another terminal run: npm run seed
import { MongoClient } from "mongodb";

const APP = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const accounts = [
  { name: "WedPlan Admin", email: process.env.ADMIN_EMAIL || "admin@wedplan.com", password: process.env.ADMIN_PASSWORD || "Admin1234", role: "admin" },
  { name: "Demo Vendor", email: "vendor@wedplan.com", password: "Vendor1234", role: "vendor" },
  { name: "Demo Customer", email: "customer@wedplan.com", password: "Customer1234", role: "customer" },
];

for (const a of accounts) {
  const res = await fetch(`${APP}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: APP },
    body: JSON.stringify({ name: a.name, email: a.email, password: a.password, role: a.role === "admin" ? "customer" : a.role }),
  });
  console.log(a.email, res.ok ? "created" : `skipped (${res.status}) - probably exists`);
}

const client = await new MongoClient(process.env.MONGODB_URI).connect();
const db = client.db(process.env.MONGODB_DB || "wedplan");
const users = db.collection("users");

// Admin accounts can only be assigned directly in the database, never through public sign-up
for (const a of accounts) await users.updateOne({ email: a.email.toLowerCase() }, { $set: { role: a.role, isBlocked: false } });

const vendor = await users.findOne({ email: "vendor@wedplan.com" });
const services = db.collection("services");
if (vendor && (await services.countDocuments({ vendorId: String(vendor._id) })) === 0) {
  // Unsplash photos, free to use under the Unsplash License (verified from each photo page)
  const photos = {
    "Photography & Videography": "photo-1759271493839-be0cf1d86537",
    "Wedding Venues": "photo-1762765685348-4bced247d12c",
    "Decoration & Florist": "photo-1570924751227-8153476322f9",
    "Catering Services": "photo-1695641738244-25e5355e9a42",
    "Makeup & Styling": "photo-1592343516059-cf2712eb0dee",
    "Wedding Fashion": "photo-1588842867976-fd084ca2c87b",
  };
  const img = (category) => `https://images.unsplash.com/${photos[category]}?auto=format&fit=crop&w=1200&q=70`;
  const base = [
    ["Cinematic Wedding Films", "Photography & Videography", 1200, "Dhaka", "A two-person crew covering your ceremony and reception, delivered as a 5-minute highlight film and a full-length edit."],
    ["Signature Wedding Portraits", "Photography & Videography", 650, "Chattogram", "Natural-light portraits of the couple and family, with 300+ edited photos in an online gallery."],
    ["Lakeside Garden Venue", "Wedding Venues", 3500, "Sylhet", "An open-air garden venue for up to 400 guests with a covered stage, bridal suite and parking."],
    ["Grand Ballroom Hall", "Wedding Venues", 4800, "Dhaka", "Air-conditioned ballroom with a 600-guest capacity, in-house sound and lighting."],
    ["Floral Stage & Entrance Design", "Decoration & Florist", 900, "Dhaka", "Fresh-flower stage backdrops, aisle arrangements and table centrepieces matched to your colours."],
    ["Traditional Biye Catering", "Catering Services", 15, "Dhaka", "Per-guest pricing for a full traditional menu, with live stations and trained serving staff."],
    ["Bridal Makeup & Styling", "Makeup & Styling", 300, "Rajshahi", "Trial session plus ceremony-day makeup and hair for the bride and two family members."],
    ["Custom Sherwani & Saree Tailoring", "Wedding Fashion", 450, "Khulna", "Made-to-measure outfits for the couple with two fittings and an alteration window before the date."],
  ];
  const now = new Date();
  await services.insertMany(base.map(([serviceName, category, price, location, description], i) => ({
    vendorId: String(vendor._id), serviceName, category, description, price, location,
    images: [img(category)], status: "approved", isActive: true, createdAt: new Date(now - i * 3600_000), updatedAt: now,
  })));
  console.log("Inserted", base.length, "demo services");
}
await client.close();
console.log("\nSeed finished.\nAdmin login:", accounts[0].email, "/", accounts[0].password);
