import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp Bot - Simple & Elegant',
  description: 'Manage your WhatsApp bot with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
