import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Helmet } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Direkt import - lazy() SSR ile çalışmaz
import Home from './pages/Home';
import Listings from './pages/Listings';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Packages from './pages/Packages';

export function render(url) {
  const helmetContext = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Helmet>
              <html lang="tr" />
              <meta name="robots" content="index,follow,max-image-preview:large" />
            </Helmet>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ilanlar" element={<Listings />} />
                <Route path="/paketler" element={<Packages />} />
                <Route path="/iletisim" element={<Contact />} />
                <Route path="/gizlilik" element={<Privacy />} />
                <Route path="/kullanim-sartlari" element={<Terms />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </StaticRouter>
    </HelmetProvider>
  );

  const { helmet } = helmetContext;
  return { html, helmet };
}
