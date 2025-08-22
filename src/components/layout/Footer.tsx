import Link from 'next/link';
import { Coins, Mail, Shield, FileText } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-500 p-2 rounded-full">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">The Good Loose Coins</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Transforming spare change into meaningful impact. Connect with our community 
              of generous donors and beneficiaries to make a difference, one coin at a time.
            </p>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="h-4 w-4" />
              <span>thegoodloosecoins@gmail.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#technology" className="text-gray-300 hover:text-white transition-colors">
                  Technology
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/signup" className="text-gray-300 hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-gray-300 hover:text-white transition-colors">
                  Legal Information
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 The Good Loose Coins. All rights reserved.</p>
          <p className="text-sm mt-2">Made with ❤️ for meaningful community impact</p>
        </div>
      </div>
    </footer>
  );
}