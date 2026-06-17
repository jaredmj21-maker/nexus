import './globals.css';

export const metadata = {
  title: 'Nexus',
  description: 'Modern AI sports market analysis.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
