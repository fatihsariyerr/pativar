import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Hoş geldiniz! 🐾');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Giriş başarısız');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SEO title="Giriş Yap" description="PatiVar hesabınıza giriş yapın." noindex />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block text-5xl mb-3 float-animation">🐾</div>
          <h1 className="font-display font-extrabold text-2xl text-gray-800">Tekrar Hoş Geldiniz!</h1>
          <p className="text-sm text-gray-500 mt-1">PatiVar hesabınıza giriş yapın</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">E-posta Adresi</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="ornek@email.com" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Şifre</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="••••••" className="input-field !pr-12" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? '⏳ Giriş yapılıyor...' : '🔑 Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Hesabınız yok mu?{' '}
              <Link to="/kayit" className="text-peach-500 font-bold hover:text-peach-600 transition-colors">Ücretsiz Kayıt Ol</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
