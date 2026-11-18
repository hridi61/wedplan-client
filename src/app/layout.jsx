import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Providers from "@/components/providers";

export const metadata = {
  title: { default: "WedPlan - Wedding Planning Platform", template: "%s | WedPlan" },
  description: "Discover wedding venues, photographers, florists, caterers and stylists, then request bookings in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
