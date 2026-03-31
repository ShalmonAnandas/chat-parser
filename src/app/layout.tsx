import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chat Parser – GitHub Copilot Chat Viewer',
  description: 'Parse and display GitHub Copilot chat export JSON files',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d1117] text-[#e6edf3] font-sans antialiased">{children}</body>
    </html>
  );
}
