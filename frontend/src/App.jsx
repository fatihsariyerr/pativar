import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const Listings = lazy(() => import('./pages/Listings'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const EditListing = lazy(() => import('./pages/EditListing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Packages = lazy(() => import('./pages/Packages'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Contact = lazy(() => import('./pages/Contact'));


function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#fff', color: '#2D3436', borderRadius: '1rem', fontFamily: 'Quicksand', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)' }
      }} />
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ilanlar" element={<Listings />} />
            <Route path="/ilan/:id" element={<ListingDetail />} />
            <Route path="/ilan-ver" element={<CreateListing />} />
            <Route path="/ilan-duzenle/:id" element={<EditListing />} />
            <Route path="/giris" element={<Login />} />
            <Route path="/kayit" element={<Register />} />
            <Route path="/profil" element={<Profile />} />
            <Route path="/paketler" element={<Packages />} />
            <Route path="/odeme/:plan" element={<Checkout />} />
            <Route path="/favoriler" element={<Favorites />} />
            <Route path="/gizlilik" element={<Privacy />} />
            <Route path="/kullanim-sartlari" element={<Terms />} />
            <Route path="/iletisim" element={<Contact />} />

          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
