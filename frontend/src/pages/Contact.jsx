import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';

const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const ops = [
    { symbol: '+', fn: (x, y) => x + y },
    { symbol: '−', fn: (x, y) => x - y },
    { symbol: '×', fn: (x, y) => x * y },
  ];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const first = Math.max(a, b);
  const second = Math.min(a, b);
  return {
    question: `${first} ${op.symbol} ${second}`,
    answer: String(op.fn(first, second))
  };
};

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    {children}
  </div>
);

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', captcha: '' });
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'İletişim - PatiVar'; }, []);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const refreshCaptcha = () => { setCaptcha(generateCaptcha()); update('captcha', ''); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      return toast.error('Lütfen tüm alanları doldurun');
    }
    if (!form.captcha) return toast.error('Doğrulama cevabını girin');
    if (String(form.captcha).trim() !== captcha.answer) {
      toast.error('Doğrulama cevabı yanlış');
      refreshCaptcha();
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contact', {
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: form.message,
        captcha_answer: form.captcha,
        captcha_expected: captcha.answer
      });
      toast.success('Mesajınız gönderildi! En kısa sürede dönüş yapılacaktır.');
      setForm({ name: '', email: '', subject: '', message: '', captcha: '' });
      refreshCaptcha();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || data?.errors?.map(e => e.msg).join(', ') || 'Mesaj gönderilemedi';
      toast.error(msg);
      refreshCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <SEO
        title="İletişim"
        description="PatiVar ile iletişime geçin. Sorularınız, önerileriniz ve destek talepleriniz için bize ulaşın."
        keywords="pativar iletişim, pet platformu iletişim, destek"
      />
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-xs font-medium text-gray-600 border border-white/60">
          <span>✉️</span> Bize Ulaşın
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">
          <span className="bg-gradient-to-r from-peach-500 to-lavender-500 bg-clip-text text-transparent">
            İletişim
          </span>
        </h1>
        <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
          Sorularınız, önerileriniz veya geri bildirimleriniz için bize yazın.
          Ekibimiz en kısa sürede size dönüş yapacaktır.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info cards */}
        <div className="space-y-4 lg:col-span-1">
          <div className="card p-5">
            <div className="text-3xl mb-2">📍</div>
            <h3 className="font-display font-bold text-base text-gray-800">Adres</h3>
            <p className="text-sm text-gray-500 mt-1">İstanbul, Türkiye</p>
          </div>
          <div className="card p-5">
            <div className="text-3xl mb-2">⏰</div>
            <h3 className="font-display font-bold text-base text-gray-800">Destek Saatleri</h3>
            <p className="text-sm text-gray-500 mt-1">Pzt - Cum: 09:00 - 18:00</p>
          </div>
          <div className="card p-5 bg-gradient-to-br from-peach-50 to-lavender-50">
            <div className="text-3xl mb-2">💬</div>
            <h3 className="font-display font-bold text-base text-gray-800">Hızlı Yanıt</h3>
            <p className="text-sm text-gray-500 mt-1">Mesajlarınıza genellikle 24 saat içinde yanıt veriyoruz.</p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={submit} className="card p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-gray-800 mb-2">Mesaj Gönder</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ad Soyad" required>
                <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="Adınız soyadınız" className="input-field" maxLength={100} />
              </Field>
              <Field label="E-posta" required>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="ornek@email.com" className="input-field" maxLength={255} />
              </Field>
            </div>

            <Field label="Konu" required>
              <input type="text" value={form.subject} onChange={e => update('subject', e.target.value)}
                placeholder="Mesajınızın konusu" className="input-field" maxLength={200} />
            </Field>

            <Field label="Mesajınız" required>
              <textarea value={form.message} onChange={e => update('message', e.target.value)}
                placeholder="Mesajınızı buraya yazın..." className="input-field !rounded-2xl min-h-[140px] resize-y"
                maxLength={5000} />
              <p className="text-[10px] text-gray-400 mt-1 text-right">{form.message.length}/5000</p>
            </Field>

            {/* Captcha */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sage-50 to-sky-50 border-2 border-sage-200">
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                🛡️ Robot Doğrulaması <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <div className="px-4 py-2.5 rounded-xl bg-white font-display font-black text-lg text-gray-800 tracking-wider select-none"
                    style={{ textDecoration: 'line-through', textDecorationStyle: 'wavy', textDecorationColor: '#94a3b8' }}>
                    {captcha.question}
                  </div>
                  <span className="text-xl text-gray-400">=</span>
                  <input type="text" value={form.captcha} onChange={e => update('captcha', e.target.value)}
                    placeholder="?" className="input-field !w-24 text-center font-bold" maxLength={5} />
                </div>
                <button type="button" onClick={refreshCaptcha}
                  className="p-2.5 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-500 transition-all"
                  title="Yenile">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5"/>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                    <path d="M8 16H3v5"/>
                  </svg>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Yukarıdaki matematik işleminin sonucunu giriniz.</p>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? '⏳ Gönderiliyor...' : '📨 Mesajı Gönder'}
            </button>

            <p className="text-[11px] text-gray-400 text-center">
              Mesajınızı göndererek{' '}
              <a href="/gizlilik" className="text-peach-500 hover:underline">gizlilik politikamızı</a> kabul etmiş sayılırsınız.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
