import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

export default function EditListing() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catBreeds, setCatBreeds] = useState([]);
  const [dogBreeds, setDogBreeds] = useState([]);
  const [featuredCredits, setFeaturedCredits] = useState(0);

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
    Promise.all([
      api.get('/breeds/cats'),
      api.get('/breeds/dogs'),
      api.get(`/listings/user/my-listings/${id}`)
    ]).then(([catsRes, dogsRes, listingRes]) => {
      setCatBreeds(catsRes.data);
      setDogBreeds(dogsRes.data);

      const l = listingRes.data;
      setFeaturedCredits(l.featured_credits || 0);

      setForm({
        title: l.title || '',
        description: l.description || '',
        pet_type: l.pet_type || '',
        purpose: l.purpose || 'adoption',
        city: l.city || '',
        district: l.district || '',
        contact_whatsapp: l.contact_whatsapp || false,
        is_featured: l.is_featured || false
      });

      if (l.pet_details) {
        const d = l.pet_details;
        setDetails({
          breed_id: d.breed_id || '',
          gender: d.gender || '',
          age_years: d.age_years ?? '',
          age_months: d.age_months ?? '',
          color: d.color || '',
          coat_length: d.coat_length || '',
          eye_color: d.eye_color || '',
          weight_kg: d.weight_kg || '',
          height_cm: d.height_cm || '',
          size: d.size || '',
          is_neutered: d.is_neutered || false,
          is_vaccinated: d.is_vaccinated || false,
          is_microchipped: d.is_microchipped || false,
          is_dewormed: d.is_dewormed || false,
          is_fiv_felv_tested: d.is_fiv_felv_tested || false,
          fiv_felv_result: d.fiv_felv_result || '',
          is_rabies_vaccinated: d.is_rabies_vaccinated || false,
          is_litter_trained: d.is_litter_trained || false,
          is_indoor: d.is_indoor ?? true,
          is_house_trained: d.is_house_trained || false,
          is_leash_trained: d.is_leash_trained || false,
          is_crate_trained: d.is_crate_trained || false,
          is_good_with_kids: d.is_good_with_kids ?? null,
          is_good_with_dogs: d.is_good_with_dogs ?? null,
          is_good_with_cats: d.is_good_with_cats ?? null,
          energy_level: d.energy_level || 3,
          barking_level: d.barking_level || 3,
          training_level: d.training_level || 3,
          health_status: d.health_status || 'healthy',
          health_notes: d.health_notes || '',
          has_pedigree: d.has_pedigree || false,
          pedigree_number: d.pedigree_number || '',
          personality: d.personality || '',
          special_needs: d.special_needs || '',
          dietary_notes: d.dietary_notes || '',
          exercise_needs: d.exercise_needs || ''
        });
      }
      setLoading(false);
    }).catch(() => {
      toast.error('İlan bilgileri yüklenemedi');
      navigate('/profil');
    });
  }, [user, id]);

  const updateForm = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const updateDetails = (key, val) => setDetails(d => ({ ...d, [key]: val }));

  const breeds = form.pet_type === 'cat' ? catBreeds : dogBreeds;
  const isCat = form.pet_type === 'cat';

  const submit = async () => {
    if (!form.title || !form.pet_type || !form.city || !details.gender) {
      return toast.error('Lütfen zorunlu alanları doldurun');
    }
    setSubmitting(true);
    try {
      const payload = { ...form, pet_details: details };
      await api.put(`/listings/${id}`, payload);
      toast.success('İlan başarıyla güncellendi!');
      navigate('/profil');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.error || data?.errors?.map(e => e.msg).join(', ') || 'İlan güncellenemedi';
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  if (!user) return null;
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <span className="text-4xl animate-spin inline-block">⏳</span>
        <p className="mt-3 text-gray-500">İlan yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="İlanı Düzenle" noindex />
      <h1 className="font-display font-extrabold text-2xl text-gray-800 mb-2">✏️ İlanı Düzenle</h1>
      <p className="text-sm text-gray-500 mb-6">İlan bilgilerinizi güncelleyebilirsiniz.</p>

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
                  <div className={`flex-1 p-4 rounded-2xl text-center font-bold border-3 ${
                    form.pet_type === 'cat' ? 'bg-lavender-50 border-lavender-300 text-lavender-600 shadow-sm' : 'bg-white/50 border-gray-200 text-gray-400'
                  }`}>
                    <span className="text-3xl block mb-1">🐱</span> Kedi
                  </div>
                  <div className={`flex-1 p-4 rounded-2xl text-center font-bold border-3 ${
                    form.pet_type === 'dog' ? 'bg-sky-50 border-sky-300 text-sky-600 shadow-sm' : 'bg-white/50 border-gray-200 text-gray-400'
                  }`}>
                    <span className="text-3xl block mb-1">🐶</span> Köpek
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Hayvan türü düzenlenemez.</p>
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

              {/* Öne Çıkar seçeneği - sadece henüz öne çıkmamış ve hakkı varsa */}
              {(!form.is_featured && featuredCredits > 0) && (
                <div className={`p-4 rounded-2xl border-2 transition-all bg-white/50 border-gray-200`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-700 flex items-center gap-1.5">
                        <span>⭐</span> İlanı Öne Çıkar
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Öne çıkan ilanlar listelerde en üstte görünür. Kalan hak: <span className="font-bold text-amber-500">{featuredCredits}</span>
                      </p>
                    </div>
                    <button type="button" onClick={() => updateForm('is_featured', true)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-100 text-amber-600 hover:bg-amber-200 transition-all">
                      Öne Çıkar
                    </button>
                  </div>
                </div>
              )}
              {form.is_featured && (
                <div className="p-4 rounded-2xl border-2 bg-amber-50 border-amber-300">
                  <p className="font-semibold text-sm text-amber-600 flex items-center gap-1.5">
                    <span>⭐</span> Bu ilan öne çıkarılmış
                  </p>
                </div>
              )}
            </div>
          </Section>

          <div className="flex justify-end">
            <button onClick={() => setStep(2)} className="btn-primary">Devam Et →</button>
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
              {submitting ? '⏳ Güncelleniyor...' : '✅ İlanı Güncelle'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
