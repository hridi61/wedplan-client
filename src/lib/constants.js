export const CATEGORIES = [
  { name: "Photography & Videography", icon: "Camera", blurb: "Films and portraits that keep the day alive" },
  { name: "Wedding Venues", icon: "Landmark", blurb: "Halls, gardens and resorts for every guest list" },
  { name: "Decoration & Florist", icon: "Flower2", blurb: "Stages, florals and lighting to set the mood" },
  { name: "Catering Services", icon: "UtensilsCrossed", blurb: "Menus built around your families' tastes" },
  { name: "Makeup & Styling", icon: "Sparkles", blurb: "Bridal looks from trial to ceremony" },
  { name: "Wedding Fashion", icon: "Shirt", blurb: "Outfits and tailoring for the couple and family" },
];

// Photos from Unsplash (free to use under the Unsplash License). IDs were taken from each photo's own page.
const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
export const HERO_PHOTO = u("photo-1759271493839-be0cf1d86537", 2000); // Josh Batres
export const CATEGORY_PHOTOS = {
  "Photography & Videography": u("photo-1759271493839-be0cf1d86537"), // Josh Batres
  "Wedding Venues": u("photo-1762765685348-4bced247d12c"), // Adrien Olichon
  "Decoration & Florist": u("photo-1570924751227-8153476322f9"), // Jamie Coupaud
  "Catering Services": u("photo-1695641738244-25e5355e9a42"), // Benjamin Brunner
  "Makeup & Styling": u("photo-1592343516059-cf2712eb0dee"), // Victoria Priessnitz
  "Wedding Fashion": u("photo-1588842867976-fd084ca2c87b"), // Vivek Baghel
};
