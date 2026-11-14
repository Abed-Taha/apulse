import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import Script from 'next/script';
import { THEME_STORAGE_KEY } from './theme';
import { Providers } from './providers';
import './globals.css';

const themeInitializationScript = `
  const savedTheme = localStorage.getItem('${THEME_STORAGE_KEY}');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.dataset.theme = savedTheme;
  }
`;

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Apulse',
  description: 'Enterprise E-commerce & Operations Platform',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script id="apulse-theme-init" strategy="beforeInteractive">
          {themeInitializationScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
