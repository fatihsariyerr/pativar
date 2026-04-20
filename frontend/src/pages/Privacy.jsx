import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Section = ({ title, children }) => (
  <div className="card p-6 mb-4">
    <h2 className="font-display font-bold text-lg text-gray-800 mb-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <SEO
        title="Gizlilik Politikası"
        description="PatiVar gizlilik politikası ve kişisel verilerin korunması hakkında bilgilendirme."
      />
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-xs font-medium text-gray-600 border border-white/60">
          <span>🔒</span> Son Güncelleme: 17 Nisan 2026
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">
          <span className="bg-gradient-to-r from-peach-500 to-lavender-500 bg-clip-text text-transparent">
            Gizlilik Politikası
          </span>
        </h1>
        <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
          Kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu anlamanız bizim için önemlidir.
        </p>
      </div>

      <Section title="1. Toplanan Bilgiler">
        <p>PatiVar olarak, hizmetlerimizi sunabilmek için aşağıdaki bilgileri topluyoruz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Hesap Bilgileri:</strong> Ad, soyad, e-posta adresi, telefon numarası</li>
          <li><strong>İlan Bilgileri:</strong> Hayvan detayları, fotoğraflar, konum (şehir/ilçe)</li>
          <li><strong>İletişim Bilgileri:</strong> Mesajlaşma geçmişi ve destek talepleri</li>
          <li><strong>Teknik Bilgiler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri</li>
        </ul>
      </Section>

      <Section title="2. Bilgilerin Kullanımı">
        <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Hesabınızı oluşturmak ve yönetmek</li>
          <li>İlan yayınlama ve görüntüleme hizmetlerini sunmak</li>
          <li>Sahipleneceklerle iletişim kurmanızı sağlamak</li>
          <li>Hizmetlerimizi iyileştirmek ve güvenliği sağlamak</li>
          <li>Yasal yükümlülükleri yerine getirmek</li>
        </ul>
      </Section>

      <Section title="3. Bilgi Paylaşımı">
        <p>
          Kişisel bilgileriniz üçüncü taraflarla <strong>rızanız olmadan paylaşılmaz</strong>.
          İstisnai durumlar:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Yasal zorunluluk veya mahkeme kararı</li>
          <li>Platform güvenliğinin korunması</li>
          <li>Kullanım koşullarının ihlali durumunda</li>
        </ul>
      </Section>

      <Section title="4. Çerezler (Cookies)">
        <p>
          Sitemizde oturum bilgilerinizi korumak ve kullanıcı deneyimini iyileştirmek için
          çerezler kullanılmaktadır. Tarayıcınızdan çerez tercihlerinizi düzenleyebilirsiniz.
        </p>
      </Section>

      <Section title="5. Verilerin Güvenliği">
        <p>
          Kişisel verilerinizin güvenliği için endüstri standartlarında güvenlik önlemleri
          uygulanmaktadır: Şifreleme, güvenli veritabanı, düzenli güvenlik denetimleri.
        </p>
      </Section>

      <Section title="6. KVKK Hakları">
        <p>6698 sayılı KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>Verilerinize erişme ve kopya talep etme</li>
          <li>Yanlış verilerin düzeltilmesini isteme</li>
          <li>Verilerinizin silinmesini talep etme</li>
          <li>İşlemeye itiraz etme hakkı</li>
        </ul>
      </Section>

      <Section title="7. İletişim">
        <p>
          Gizlilik politikamız hakkında soru veya talepleriniz için{' '}
          <Link to="/iletisim" className="text-peach-500 font-semibold hover:underline">
            iletişim sayfamız
          </Link>{' '}
          üzerinden bize ulaşabilirsiniz.
        </p>
      </Section>
    </div>
  );
}
