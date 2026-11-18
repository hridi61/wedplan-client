import { auth } from "@/lib/auth";

export const runtime = "nodejs";
const MAX = 5 * 1024 * 1024;

// Signed-in users upload through here so the ImgBB key never reaches the browser.
export async function POST(req) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return Response.json({ message: "Please sign in to upload images" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("image");
  if (!file || typeof file === "string") return Response.json({ message: "No image provided" }, { status: 400 });
  if (!file.type?.startsWith("image/")) return Response.json({ message: "Only image files are allowed" }, { status: 400 });
  if (file.size > MAX) return Response.json({ message: "Image must be smaller than 5MB" }, { status: 400 });
  if (!process.env.IMGBB_API_KEY) return Response.json({ message: "Image hosting is not configured" }, { status: 500 });

  const body = new FormData();
  body.append("image", file);
  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, { method: "POST", body });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error("upload failed");
    return Response.json({ url: json.data.display_url });
  } catch {
    return Response.json({ message: "Image upload failed. Please try again." }, { status: 502 });
  }
}
