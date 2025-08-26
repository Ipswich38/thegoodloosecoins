'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import Image from 'next/image';
import { User } from '@/types/auth';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuthStatus();
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navLinks = [
    { href: '/#about', label: 'About' },
    { href: '/#technology', label: 'Technology' },
    { href: '/#contact', label: 'Contact' },
  ];

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10">
              <Image 
                src="/th good loose coins (3).png" 
                alt="The Good Loose Coins Logo" 
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-xl text-gray-900">TG/LC</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isDashboard && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium">{user.username}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href={`/dashboard/${user.type.toLowerCase()}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <a
                  href="/#hero"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  Sign Up
                </a>
                <a
                  href="/#hero"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {!isDashboard && navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}

              {user ? (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <UserIcon className="h-4 w-4" />
                    {user.username}
                  </div>
                  <Link
                    href={`/dashboard/${user.type.toLowerCase()}`}
                    className="block text-gray-600 hover:text-primary-600 pl-6"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block text-gray-600 hover:text-primary-600 pl-6"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <a
                    href="/#hero"
                    className="block text-primary-600 hover:text-primary-700 px-4 py-2 font-medium transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </a>
                  <a
                    href="/#hero"
                    className="block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}