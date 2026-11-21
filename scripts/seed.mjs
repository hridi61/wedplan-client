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
if (vendor) {
  // Unsplash photos, free to use under the Unsplash License. One photo per demo service.
  // Credits: Ben Atkins, Josh Batres, Jonathan Borba, Adrien Olichon, Alexander Mass,
  // Thomas Beaman, Victoria Priessnitz, Talha Hadi.
  const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
  const base = [
    ["Cinematic Wedding Films", "Photography & Videography", 1200, "Dhaka", "A two-person crew covering your ceremony and reception, delivered as a 5-minute highlight film and a full-length edit.", "photo-1722805740177-04256b6517f2"],
    ["Signature Wedding Portraits", "Photography & Videography", 650, "Chattogram", "Natural-light portraits of the couple and family, with 300+ edited photos in an online gallery.", "photo-1759271493839-be0cf1d86537"],
    ["Lakeside Garden Venue", "Wedding Venues", 3500, "Sylhet", "An open-air garden venue for up to 400 guests with a covered stage, bridal suite and parking.", "photo-1769812344081-92b3e2ac39c0"],
    ["Grand Ballroom Hall", "Wedding Venues", 4800, "Dhaka", "Air-conditioned ballroom with a 600-guest capacity, in-house sound and lighting.", "photo-1762765685348-4bced247d12c"],
    ["Floral Stage & Entrance Design", "Decoration & Florist", 900, "Dhaka", "Fresh-flower stage backdrops, aisle arrangements and table centrepieces matched to your colours.", "photo-1783818413085-b6ec40e8e818"],
    ["Traditional Biye Catering", "Catering Services", 15, "Dhaka", "Per-guest pricing for a full traditional menu, with live stations and trained serving staff.", "photo-1676734628558-624737d3e094"],
    ["Bridal Makeup & Styling", "Makeup & Styling", 300, "Rajshahi", "Trial session plus ceremony-day makeup and hair for the bride and two family members.", "photo-1592343516059-cf2712eb0dee"],
    ["Custom Sherwani & Saree Tailoring", "Wedding Fashion", 450, "Khulna", "Made-to-measure outfits for the couple with two fittings and an alteration window before the date.", "photo-1707576763859-19e8c69450ad"],
  ];
  const now = new Date();
  if ((await services.countDocuments({ vendorId: String(vendor._id) })) === 0) {
    await services.insertMany(base.map(([serviceName, category, price, location, description, photoId], i) => ({
      vendorId: String(vendor._id), serviceName, category, description, price, location,
      images: [photo(photoId)], status: "approved", isActive: true, createdAt: new Date(now - i * 3600_000), updatedAt: now,
    })));
    console.log("Inserted", base.length, "demo services");
  } else {
    // Services already exist: only refresh the photos of the demo services (matched by name)
    for (const [serviceName, , , , , photoId] of base)
      await services.updateOne({ vendorId: String(vendor._id), serviceName }, { $set: { images: [photo(photoId)], updatedAt: now } });
    console.log("Updated photos of the demo services");
  }
}
await client.close();
console.log("\nSeed finished.\nAdmin login:", accounts[0].email, "/", accounts[0].password);