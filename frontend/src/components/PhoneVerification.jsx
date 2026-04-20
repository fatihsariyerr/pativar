import React, { useEffect, useRef, useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../utils/firebase';
import toast from 'react-hot-toast';

export default function PhoneVerification({ phone, onVerified, disabled }) {
  const [step, setStep] = useState('idle');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const confirmationRef = useRef(null);
  const verifierRef = useRef(null);
  const inFlightRef = useRef(false);

  useEffect(() => () => {
    if (verifierRef.current) {
      try { verifierRef.current.clear(); } catch {}
      verifierRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const toE164 = (raw) => {
    const d = raw.replace(/\D/g, '');
    if (d.startsWith('0')) return '+9' + d;
    if (d.startsWith('90')) return '+' + d;
    return '+90' + d;
  };

  const resetVerifier = () => {
    if (verifierRef.current) {
      try { verifierRef.current.clear(); } catch {}
      verifierRef.current = null;
    }
    const container = document.getElementById('recaptcha-container');
    if (container) container.innerHTML = '';
  };

  const sendCode = async () => {
    if (inFlightRef.current) return;
    if (!/^(\+90|0)?[0-9]{10}$/.test(phone)) {
      return toast.error('Geçerli bir telefon numarası giriniz');
    }
    inFlightRef.current = true;
    setSending(true);
    try {
      resetVerifier();
      verifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
      });
      await verifierRef.current.render();
      const confirmation = await signInWithPhoneNumber(auth, toE164(phone), verifierRef.current);
      confirmationRef.current = confirmation;
      setStep('code');
      setCooldown(60);
      toast.success('Doğrulama kodu gönderildi');
    } catch (err) {
      resetVerifier();
      const msg = err.code === 'auth/invalid-phone-number' ? 'Telefon numarası geçersiz'
        : err.code === 'auth/too-many-requests' ? 'Çok fazla deneme, daha sonra tekrar deneyin'
        : err.code === 'auth/unauthorized-domain' ? 'Bu domain Firebase\'de yetkili değil'
        : err.code === 'auth/captcha-check-failed' ? 'reCAPTCHA doğrulaması başarısız, tekrar deneyin'
        : err.message || 'Kod gönderilemedi';
      toast.error(msg);
    } finally {
      inFlightRef.current = false;
      setSending(false);
    }
  };

  const verify = async () => {
    if (code.length !== 6 || !confirmationRef.current) return;
    setVerifying(true);
    try {
      const result = await confirmationRef.current.confirm(code);
      const idToken = await result.user.getIdToken();
      setStep('verified');
      resetVerifier();
      onVerified(idToken);
      toast.success('Telefon doğrulandı');
    } catch (err) {
      toast.error(err.code === 'auth/invalid-verification-code' ? 'Kod hatalı' : 'Doğrulama başarısız');
    } finally { setVerifying(false); }
  };

  if (step === 'verified') {
    return (
      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium">
        ✓ Telefon numarası doğrulandı
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div id="recaptcha-container" className={step === 'idle' ? 'hidden' : 'flex justify-center'} />
      {step === 'idle' && (
        <button
          type="button"
          onClick={sendCode}
          disabled={disabled || sending || !phone}
          className="btn-secondary w-full text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? 'Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
        </button>
      )}
      {step === 'code' && (
        <div className="space-y-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="6 haneli kod"
            className="input-field text-center tracking-widest"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={verify}
              disabled={verifying || code.length !== 6}
              className="btn-primary flex-1 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {verifying ? 'Doğrulanıyor...' : 'Doğrula'}
            </button>
            <button
              type="button"
              onClick={sendCode}
              disabled={cooldown > 0 || sending}
              className="btn-secondary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? `${cooldown}s` : 'Yeniden Gönder'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
