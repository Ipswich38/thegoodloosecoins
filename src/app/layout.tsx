import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Good Loose Coins - Transform Spare Change into Impact',
  description: 'Connect generous donors with beneficiaries through the power of loose coins. Make a difference, one coin at a time through our trusted platform.',
  keywords: 'donations, loose coins, charity, social impact, community support, beneficiaries, donors, spare change, meaningful impact',
  openGraph: {
    title: 'The Good Loose Coins - Transform Spare Change into Impact',
    description: 'Join our community of generous donors and beneficiaries. Turn your loose coins into meaningful social impact.',
    type: 'website',
    siteName: 'The Good Loose Coins',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Good Loose Coins - Transform Spare Change into Impact',
    description: 'Connect with donors and beneficiaries. Make a difference with loose coins.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
