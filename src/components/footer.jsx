import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "./navbar";

export default function Footer() {
  return (
    <footer className="mt-20 bg-plum text-white/80">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed">Find trusted photographers, venues, florists, caterers and stylists, and send booking requests in one place.</p>
        </div>
        <div>
          <h3 className="mb-3 font-sans text-sm font-semibold text-white">Explore</h3>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" href="/">Home</Link></li>
            <li><Link className="hover:text-white" href="/services">Browse Services</Link></li>
            <li><Link className="hover:text-white" href="/signup">Become a vendor</Link></li>
            <li><Link className="hover:text-white" href="/signin">Sign In</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-sans text-sm font-semibold text-white">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" />hello@wedplan.com</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" />+880 1700-000000</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />Gulshan, Dhaka, Bangladesh</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-sans text-sm font-semibold text-white">Follow us</h3>
          <div className="flex gap-3">
            <a href="https://facebook.com" aria-label="Facebook" className="rounded-full border border-white/20 p-2 hover:bg-white/10"><Facebook className="h-4 w-4" /></a>
            <a href="https://instagram.com" aria-label="Instagram" className="rounded-full border border-white/20 p-2 hover:bg-white/10"><Instagram className="h-4 w-4" /></a>
            <a href="https://youtube.com" aria-label="YouTube" className="rounded-full border border-white/20 p-2 hover:bg-white/10"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs">&copy; {new Date().getFullYear()} WedPlan. All rights reserved.</div>
    </footer>
  );
}
