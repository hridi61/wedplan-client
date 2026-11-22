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
  // Unsplash photos, free to use under the Unsplash License. Each service gets two photos for its gallery.
  const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=70`;
  const P = {
    film: "photo-1722805740177-04256b6517f2",
    film2: "photo-1588955690622-47372b85d79b", // Dmitriy Frantsev
    portrait: "photo-1759271493839-be0cf1d86537",
    portrait2: "photo-1781211985596-f93879e1585d", // Negar Nikkhah
    garden: "photo-1769812344081-92b3e2ac39c0",
    garden2: "photo-1758810411905-04fb6f9396e1", // Pedro Pulido
    ballroom: "photo-1762765685348-4bced247d12c",
    ballroom2: "photo-1759519238029-689e99c6d19e", // Sergei Kondalov
    floral: "photo-1783818413085-b6ec40e8e818",
    floral2: "photo-1785744530706-71fd26baac6a", // elisadventure photographe
    catering: "photo-1676734628558-624737d3e094",
    catering2: "photo-1564638305579-5e395c9b62c7", // Tim Cooper
    makeup: "photo-1592343516059-cf2712eb0dee",
    makeup2: "photo-1774814304885-bb5cc796a6c3", // Rodrigo Rodrigues
    tailor: "photo-1707576763859-19e8c69450ad",
    tailor2: "photo-1785765599557-f3666cdc095a", // Sushanta Rokka
  };
  const base = [
    ["Cinematic Wedding Films", "Photography & Videography", 1200, "Dhaka", "A two-person crew covering your ceremony and reception, delivered as a 5-minute highlight film and a full-length edit.", [P.film, P.film2]],
    ["Signature Wedding Portraits", "Photography & Videography", 650, "Chattogram", "Natural-light portraits of the couple and family, with 300+ edited photos in an online gallery.", [P.portrait, P.portrait2]],
    ["Lakeside Garden Venue", "Wedding Venues", 3500, "Sylhet", "An open-air garden venue for up to 400 guests with a covered stage, bridal suite and parking.", [P.garden, P.garden2]],
    ["Grand Ballroom Hall", "Wedding Venues", 4800, "Dhaka", "Air-conditioned ballroom with a 600-guest capacity, in-house sound and lighting.", [P.ballroom, P.ballroom2]],
    ["Floral Stage & Entrance Design", "Decoration & Florist", 900, "Dhaka", "Fresh-flower stage backdrops, aisle arrangements and table centrepieces matched to your colours.", [P.floral, P.floral2]],
    ["Traditional Biye Catering", "Catering Services", 15, "Dhaka", "Per-guest pricing for a full traditional menu, with live stations and trained serving staff.", [P.catering, P.catering2]],
    ["Bridal Makeup & Styling", "Makeup & Styling", 300, "Rajshahi", "Trial session plus ceremony-day makeup and hair for the bride and two family members.", [P.makeup, P.makeup2]],
    ["Custom Sherwani & Saree Tailoring", "Wedding Fashion", 450, "Khulna", "Made-to-measure outfits for the couple with two fittings and an alteration window before the date.", [P.tailor, P.tailor2]],
  ];
  const now = new Date();
  const vendorId = String(vendor._id);
  for (const [i, [serviceName, category, price, location, description, ids]] of base.entries()) {
    const images = ids.map(photo);
    const found = await services.findOne({ vendorId, serviceName });
    if (found) {
      await services.updateOne({ _id: found._id }, { $set: { images, updatedAt: now } });
    } else {
      await services.insertOne({ vendorId, serviceName, category, description, price, location, images, status: "approved", isActive: true, createdAt: new Date(now - i * 3600_000), updatedAt: now });
    }
  }
  console.log("Seeded demo services with 2 photos each");
}
await client.close();
console.log("\nSeed finished.\nAdmin login:", accounts[0].email, "/", accounts[0].password);