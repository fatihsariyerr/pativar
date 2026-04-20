import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { cities } from '../utils/cities';
import SEO from '../components/SEO';

const Section = ({ title, icon, children }) => (
  <div className="card p-5 mb-4">
    <h3 className="font-display font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
      <span className="text-xl">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label} {required && <span className="text-rose-400">*</span>}</label>
    {children}
  </div>
);

const Toggle = ({ label, icon, checked, onChange }) => (
  <button type="button" onClick={() => onChange(!checked)}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
      checked ? 'bg-sage-50 border-sage-300 text-sage-700' : 'bg-white/50 border-gray-200 text-gray-500 hover:border-gray-300'
    }`}>
    <span>{icon}</span>
    {label}
    {checked && <span className="text-sage-500 ml-auto">✓</span>}
  </button>
);

const TriState = ({ label, value, onChange }) => (
  <div className="flex items-center gap-1">
    <span className="text-xs text-gray-500 w-24">{label}</span>
    {[{ v: true, l: 'Evet', c: 'bg-sage-100 text-sage-700 border-sage-300' },
      { v: false, l: 'Hayır', c: 'bg-rose-50 text-rose-600 border-rose-200' },
      { v: null, l: 'Bilinmiyor', c: 'bg-gray-100 text-gray-500 border-gray-200' }
    ].map(opt => (
      <button key={String(opt.v)} type="button" onClick={() => onChange(opt.v)}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium border-2 transition-all ${value === opt.v ? opt.c : 'border-transparent bg-gray-50 text-gray-400'}`}>
        {opt.l}
      </button>
    ))}
  </div>
);

const LevelPicker = ({ label, value, onChange, max = 5 }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500 w-24">{label}</span>
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}
          className={`w-7 h-4 rounded-full transition-all ${i < value ? 'bg-peach-400' : 'bg-gray-200'}`} />
      ))}
    </div>
    <span className="text-xs text-gray-400">{value}/{max}</span>
  </div>
);

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [catBreeds, setCatBreeds] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', pet_type: '', purpose: 'adoption',
    city: '', district: '', contact_whatsapp: false, is_featured: false
  });

  const [details, setDetails] = useState({
    breed_id: '', gender: '', age_years: '', age_months: '', color: '', coat_length: '',
    eye_color: '', weight_kg: '', height_cm: '', size: '',
    is_neutered: false, is_vaccinated: false, is_microchipped: false, is_dewormed: false,
    is_fiv_felv_tested: false, fiv_felv_result: '', is_rabies_vaccinated: false,
    is_litter_trained: false, is_indoor: true, is_house_trained: false,
    is_leash_trained: false, is_crate_trained: false,
    is_good_with_kids: null, is_good_with_dogs: null, is_good_with_cats: null,
    energy_level: 3, barking_level: 3, training_level: 3,
    health_status: 'healthy', health_notes: '', has_pedigree: false, pedigree_number: '',
    personality: '', special_needs: '', dietary_notes: '', exercise_needs: ''
  });

  useEffect(() => {
    if (!user) { navigate('/giris'); return; }
    api.get('/breeds/cats').then(r => setCatBreeds(r.data)).catch(() => {});
    api.get('/breeds/dogs').then(r => setDogBreeds(r.data)).catch(() => {});
  }, [user]);

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const updateDetails = (key, val) => setDetails(d => ({ ...d, [key]: val }));

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      return toast.error('En fazla 5 fotoğraf yükleyebilirsiniz');
    }
    const validFiles = files.filter(f => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
        toast.error(`${f.name}: Sadece JPEG, PNG ve WebP desteklenir`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name}: Maksimum 5MB`);
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach(f => formData.append('images', f));
      const res = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPhotos(prev => [...prev, ...res.data.images.map((img, i) => ({
        ...img,
        preview: URL.createObjectURL(validFiles[i])
      }))]);
      toast.success(`${validFiles.length} fotoğraf yüklendi`);
    } catch (err) {
      toast.error('Fotoğraf yüklenemedi');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const updated = [...prev];
      if (updated[index].preview) URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const breeds = form.pet_type === 'cat' ? catBreeds : dogBreeds;
  const isCat = form.pet_type === 'cat';

  const submit = async () => {
    if (!form.title || !form.pet_type || !form.city || !details.gender) {
      return toast.error('Lütfen zorunlu alanları doldurun');
    }
    setSubmitting(true);
    try {
      const payload = { ...form, pet_details: details };
      if (photos.length > 0) {
        payload.images = photos.map(p => ({
          url: p.url,
          thumbnail_url: p.thumbnail_url
        }));
      }
      await api.post('/listings', payload);
      toast.success('İlanınız başarıyla yayınlandı! 🎉');
      navigate('/ilanlar');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || data?.errors?.map(e => e.msg).join(', ') || 'İlan oluşturulamadı';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="İlan Ver" description="PatiVar'da kedi veya köpek ilanı verin." noindex />
      <h1 className="font-display font-extrabold text-2xl text-gray-800 mb-2">✨ Yeni İlan Oluştur</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          Paket: <span className="font-bold text-peach-500">{user.plan === 'premium' ? 'Premium' : user.plan === 'business' ? 'İşletme' : user.plan === 'basic' ? 'Temel' : 'Ücretsiz'}</span>
          {' • '}<span className="font-bold">{user.listings_used ?? 0}/{user.listing_limit ?? 1}</span> ilan kullanıldı
        </p>
        {user.plan !== 'business' && (
          <Link to="/paketler" className="text-xs font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors">
            <span>📦</span> Paketi Yükselt
          </Link>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[{ n: 1, l: 'Genel Bilgi' }, { n: 2, l: 'Hayvan Detayları' }, { n: 3, l: 'Sağlık & Davranış' }].map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && <div className={`flex-1 h-0.5 ${step > i ? 'bg-peach-400' : 'bg-gray-200'}`} />}
            <button onClick={() => setStep(s.n)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              step === s.n ? 'bg-peach-100 text-peach-600' : step > s.n ? 'bg-sage-100 text-sage-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === s.n ? 'bg-peach-500 text-white' : step > s.n ? 'bg-sage-500 text-white' : 'bg-gray-300 text-white'
              }`}>{step > s.n ? '✓' : s.n}</span>
              <span className="hidden sm:inline">{s.l}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: General */}
      {step === 1 && (
        <>
          <Section title="İlan Bilgileri" icon="📋">
            <div className="space-y-4">
              <Field label="Hayvan Türü" required>
                <div className="flex gap-3">
                  {[{ v: 'cat', l: '🐱 Kedi', c: 'lavender' }, { v: 'dog', l: '🐶 Köpek', c: 'sky' }].map(t => (
                    <button key={t.v} type="button" onClick={() => updateForm('pet_type', t.v)}
                      className={`flex-1 p-4 rounded-2xl text-center font-bold transition-all border-3 ${
                        form.pet_type === t.v ? `bg-${t.c}-50 border-${t.c}-300 text-${t.c}-600 shadow-sm` : 'bg-white/50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}>
                      <span className="text-3xl block mb-1">{t.v === 'cat' ? '🐱' : '🐶'}</span>
                      {t.v === 'cat' ? 'Kedi' : 'Köpek'}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="İlan Başlığı" required>
                <input type="text" value={form.title} onChange={e => updateForm('title', e.target.value)}
                  placeholder="örn: 3 aylık British Shorthair yavru" className="input-field" maxLength={200} />
              </Field>

              <Field label="Açıklama">
                <textarea value={form.description} onChange={e => updateForm('description', e.target.value)}
                  placeholder="Hayvanınız hakkında detaylı bilgi verin..." className="input-field !rounded-2xl min-h-[120px] resize-y" />
              </Field>

              <Field label="İlan Amacı" required>
                <div className="flex gap-2">
                  {[{ v: 'adoption', l: '🏠 Sahiplendirme' }, { v: 'mating', l: '💕 Çiftleştirme' }].map(p => (
                    <button key={p.v} type="button" onClick={() => updateForm('purpose', p.v)}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all border-2 ${
                        form.purpose === p.v ? 'bg-peach-50 border-peach-300 text-peach-600' : 'bg-white/50 border-gray-200 text-gray-500'
                      }`}>{p.l}</button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Şehir" required>
                  <select value={form.city} onChange={e => updateForm('city', e.target.value)} className="input-field">
                    <option value="">Seçiniz</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="İlçe">
                  <input type="text" value={form.district} onChange={e => updateForm('district', e.target.value)}
                    placeholder="İlçe" className="input-field" />
                </Field>
              </div>

              <Toggle label="WhatsApp ile iletişim" icon="💬" checked={form.contact_whatsapp} onChange={v => updateForm('contact_whatsapp', v)} />

              {/* Öne Çıkar seçeneği */}
              {(user.featured_listings > 0) && (
                <div className={`p-4 rounded-2xl border-2 transition-all ${form.is_featured ? 'bg-amber-50 border-amber-300' : 'bg-white/50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                        <span>⭐</span> İlanı Öne Çıkar
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Öne çıkan ilanlar listelerde en üstte görünür. Kalan hak: <span className="font-bold text-amber-500">{user.featured_listings}</span>
                      </p>
                    </div>
                    <button type="button" onClick={() => updateForm('is_featured', !form.is_featured)}
                      className={`relative w-12 h-6 rounded-full transition-all ${form.is_featured ? 'bg-amber-400' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.is_featured ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Section>

          <Section title="Fotoğraflar" icon="📸">
            <div className="space-y-3">
              <p className="text-xs text-gray-500">En fazla 5 fotoğraf yükleyebilirsiniz. İlk fotoğraf kapak görseli olur.</p>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {photos.map((photo, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-peach-200 group">
                    <img src={photo.preview || photo.url} alt={`Fotoğraf ${i + 1}`}
                      className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 badge bg-peach-500 text-white text-[9px]">Kapak</span>
                    )}
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </button>
                  </div>
                ))}

                {photos.length < 5 && (
                  <label className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    uploading ? 'border-peach-300 bg-peach-50' : 'border-gray-300 hover:border-peach-400 hover:bg-peach-50/50'
                  }`}>
                    {uploading ? (
                      <div className="text-center">
                        <span className="text-xl animate-spin inline-block">⏳</span>
                        <span className="block text-[10px] text-gray-400 mt-1">Yükleniyor...</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-2xl text-gray-400">+</span>
                        <span className="block text-[10px] text-gray-400 mt-1">{photos.length}/5</span>
                      </div>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                      onChange={handlePhotoSelect} className="hidden" disabled={uploading} />
                  </label>
                )}
              </div>
            </div>
          </Section>

          <div className="flex justify-end">
            <button onClick={() => { if (!form.pet_type) return toast.error('Hayvan türü seçin'); setStep(2); }}
              className="btn-primary">Devam Et →</button>
          </div>
        </>
      )}

      {/* Step 2: Pet Details */}
      {step === 2 && (
        <>
          <Section title={isCat ? '🐱 Kedi Detayları' : '🐶 Köpek Detayları'} icon={isCat ? '🐱' : '🐶'}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cins" required>
                  <select value={details.breed_id} onChange={e => updateDetails('breed_id', e.target.value)} className="input-field">
                    <option value="">Seçiniz</option>
                    {breeds.map(b => <option key={b.id} value={b.id}>{b.name_tr}</option>)}
                  </select>
                </Field>
                <Field label="Cinsiyet" required>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => updateDetails('gender', 'male')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        details.gender === 'male' ? 'bg-sky-50 border-sky-300 text-sky-600' : 'bg-white/50 border-gray-200 text-gray-500'
                      }`}>♂️ Erkek</button>
                    <button type="button" onClick={() => updateDetails('gender', 'female')}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        details.gender === 'female' ? 'bg-rose-50 border-rose-300 text-rose-600' : 'bg-white/50 border-gray-200 text-gray-500'
                      }`}>♀️ Dişi</button>
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Yaş (Yıl)">
                  <input type="number" value={details.age_years} onChange={e => updateDetails('age_years', e.target.value)} placeholder="0" className="input-field" min="0" max="25" />
                </Field>
                <Field label="Yaş (Ay)">
                  <input type="number" value={details.age_months} onChange={e => updateDetails('age_months', e.target.value)} placeholder="0" className="input-field" min="0" max="11" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Renk">
                  <input type="text" value={details.color} onChange={e => updateDetails('color', e.target.value)} placeholder="örn: Turuncu tabby" className="input-field" />
                </Field>
                <Field label="Tüy Uzunluğu">
                  <select value={details.coat_length} onChange={e => updateDetails('coat_length', e.target.value)} className="input-field">
                    <option value="">Seçiniz</option>
                    <option value="hairless">Tüysüz</option>
                    <option value="short">Kısa Tüy</option>
                    <option value="medium">Orta Tüy</option>
                    <option value="long">Uzun Tüy</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Ağırlık (kg)">
                  <input type="number" step="0.1" value={details.weight_kg} onChange={e => updateDetails('weight_kg', e.target.value)} placeholder="0" className="input-field" />
                </Field>
                {isCat ? (
                  <Field label="Göz Rengi">
                    <input type="text" value={details.eye_color} onChange={e => updateDetails('eye_color', e.target.value)} placeholder="örn: Mavi, Yeşil" className="input-field" />
                  </Field>
                ) : (
                  <Field label="Boy (cm)">
                    <input type="number" value={details.height_cm} onChange={e => updateDetails('height_cm', e.target.value)} placeholder="0" className="input-field" />
                  </Field>
                )}
              </div>

              {!isCat && (
                <Field label="Boyut">
                  <div className="flex gap-2 flex-wrap">
                    {[{ v: 'mini', l: '🐾 Mini' }, { v: 'small', l: '🐕‍🦺 Küçük' }, { v: 'medium', l: '🐕 Orta' }, { v: 'large', l: '🦮 Büyük' }, { v: 'giant', l: '🐻 Dev' }].map(s => (
                      <button key={s.v} type="button" onClick={() => updateDetails('size', s.v)}
                        className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                          details.size === s.v ? 'bg-peach-50 border-peach-300 text-peach-600' : 'bg-white/50 border-gray-200 text-gray-500'
                        }`}>{s.l}</button>
                    ))}
                  </div>
                </Field>
              )}

              <Field label="Karakter / Kişilik">
                <textarea value={details.personality} onChange={e => updateDetails('personality', e.target.value)}
                  placeholder="Hayvanınızın kişiliğini anlatın..." className="input-field !rounded-2xl min-h-[80px] resize-y" />
              </Field>
            </div>
          </Section>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary">← Geri</button>
            <button onClick={() => { if (!details.gender) return toast.error('Cinsiyet seçin'); setStep(3); }}
              className="btn-primary">Devam Et →</button>
          </div>
        </>
      )}

      {/* Step 3: Health & Behavior */}
      {step === 3 && (
        <>
          <Section title="Sağlık Bilgileri" icon="🏥">
            <div className="space-y-3">
              <Field label="Sağlık Durumu">
                <div className="flex gap-2">
                  {[{ v: 'healthy', l: '✅ Sağlıklı' }, { v: 'treatment_needed', l: '⚠️ Tedavi Gerekli' }, { v: 'chronic_condition', l: '🩺 Kronik' }].map(h => (
                    <button key={h.v} type="button" onClick={() => updateDetails('health_status', h.v)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        details.health_status === h.v ? 'bg-sage-50 border-sage-300 text-sage-600' : 'bg-white/50 border-gray-200 text-gray-500'
                      }`}>{h.l}</button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Toggle label="Aşıları Tam" icon="💉" checked={details.is_vaccinated} onChange={v => updateDetails('is_vaccinated', v)} />
                <Toggle label="Kısırlaştırılmış" icon="🔬" checked={details.is_neutered} onChange={v => updateDetails('is_neutered', v)} />
                <Toggle label="Mikroçipli" icon="📟" checked={details.is_microchipped} onChange={v => updateDetails('is_microchipped', v)} />
                <Toggle label="Parazit Tedavisi" icon="🐛" checked={details.is_dewormed} onChange={v => updateDetails('is_dewormed', v)} />
                {isCat && <Toggle label="FIV/FeLV Testi" icon="🧬" checked={details.is_fiv_felv_tested} onChange={v => updateDetails('is_fiv_felv_tested', v)} />}
                {!isCat && <Toggle label="Kuduz Aşısı" icon="💉" checked={details.is_rabies_vaccinated} onChange={v => updateDetails('is_rabies_vaccinated', v)} />}
                <Toggle label="Soy Kütüğü" icon="📋" checked={details.has_pedigree} onChange={v => updateDetails('has_pedigree', v)} />
              </div>

              {details.has_pedigree && (
                <Field label="Soy Kütük Numarası">
                  <input type="text" value={details.pedigree_number} onChange={e => updateDetails('pedigree_number', e.target.value)} className="input-field" />
                </Field>
              )}
              {isCat && details.is_fiv_felv_tested && (
                <Field label="FIV/FeLV Sonucu">
                  <input type="text" value={details.fiv_felv_result} onChange={e => updateDetails('fiv_felv_result', e.target.value)} placeholder="Negatif / Pozitif" className="input-field" />
                </Field>
              )}

              <Field label="Sağlık Notları">
                <textarea value={details.health_notes} onChange={e => updateDetails('health_notes', e.target.value)}
                  placeholder="Ek sağlık bilgileri..." className="input-field !rounded-2xl min-h-[60px] resize-y" />
              </Field>
            </div>
          </Section>

          <Section title="Davranış & Eğitim" icon="🐾">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {isCat ? (
                  <>
                    <Toggle label="Kum Eğitimli" icon="🚿" checked={details.is_litter_trained} onChange={v => updateDetails('is_litter_trained', v)} />
                    <Toggle label="Ev Kedisi" icon="🏠" checked={details.is_indoor} onChange={v => updateDetails('is_indoor', v)} />
                  </>
                ) : (
                  <>
                    <Toggle label="Ev Eğitimli" icon="🏠" checked={details.is_house_trained} onChange={v => updateDetails('is_house_trained', v)} />
                    <Toggle label="Tasma Eğitimli" icon="🦮" checked={details.is_leash_trained} onChange={v => updateDetails('is_leash_trained', v)} />
                    <Toggle label="Kafes Eğitimli" icon="📦" checked={details.is_crate_trained} onChange={v => updateDetails('is_crate_trained', v)} />
                  </>
                )}
              </div>

              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-gray-600">Uyumluluk</p>
                <TriState label="Çocuklarla" value={details.is_good_with_kids} onChange={v => updateDetails('is_good_with_kids', v)} />
                <TriState label="Köpeklerle" value={details.is_good_with_dogs} onChange={v => updateDetails('is_good_with_dogs', v)} />
                <TriState label="Kedilerle" value={details.is_good_with_cats} onChange={v => updateDetails('is_good_with_cats', v)} />
              </div>

              {!isCat && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-semibold text-gray-600">Seviyeler</p>
                  <LevelPicker label="⚡ Enerji" value={details.energy_level} onChange={v => updateDetails('energy_level', v)} />
                  <LevelPicker label="🔊 Havlama" value={details.barking_level} onChange={v => updateDetails('barking_level', v)} />
                  <LevelPicker label="🎓 Eğitim" value={details.training_level} onChange={v => updateDetails('training_level', v)} />
                </div>
              )}
            </div>
          </Section>

          <Section title="Ek Bilgiler" icon="📝">
            <div className="space-y-3">
              <Field label="Özel İhtiyaçlar">
                <textarea value={details.special_needs} onChange={e => updateDetails('special_needs', e.target.value)}
                  placeholder="Varsa özel bakım ihtiyaçları..." className="input-field !rounded-2xl min-h-[60px] resize-y" />
              </Field>
              <Field label="Beslenme Notları">
                <textarea value={details.dietary_notes} onChange={e => updateDetails('dietary_notes', e.target.value)}
                  placeholder="Beslenme tercihleri veya kısıtlamaları..." className="input-field !rounded-2xl min-h-[60px] resize-y" />
              </Field>
              {!isCat && (
                <Field label="Egzersiz İhtiyacı">
                  <textarea value={details.exercise_needs} onChange={e => updateDetails('exercise_needs', e.target.value)}
                    placeholder="Günlük egzersiz ihtiyacı..." className="input-field !rounded-2xl min-h-[60px] resize-y" />
                </Field>
              )}
            </div>
          </Section>

          <div className="flex justify-between">
            <button onClick={() => setStep(2)} className="btn-secondary">← Geri</button>
            <button onClick={submit} disabled={submitting} className="btn-primary">
              {submitting ? '⏳ Yayınlanıyor...' : '🎉 İlanı Yayınla'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
