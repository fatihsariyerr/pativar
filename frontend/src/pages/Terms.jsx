import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Section = ({ title, children }) => (
  <div className="card p-6 mb-4">
    <h2 className="font-display font-bold text-lg text-gray-800 mb-3">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <SEO
        title="Kullanım Şartları"
        description="PatiVar kullanım şartları ve koşulları. Platformumuzu kullanırken uymanız gereken kurallar."
      />
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 text-xs font-medium text-gray-600 border border-white/60">
          <span>📜</span> Son Güncelleme: 17 Nisan 2026
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl">
          <span className="bg-gradient-to-r from-peach-500 to-lavender-500 bg-clip-text text-transparent">
            Kullanım Şartları
          </span>
        </h1>
        <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
          PatiVar platformunu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
        </p>
      </div>

      <Section title="1. Platform Amacı">
        <p>
          PatiVar; kedi ve köpek sahiplendirme ile çiftleştirme amacıyla ilan yayınlama
          hizmeti sunan bir platformdur. <strong>Hayvan alım-satımı yasal olarak yasaktır</strong> ve
          platformumuzda kesinlikle yer almaz.
        </p>
      </Section>

      <Section title="2. Üyelik ve Hesap">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Platforma üye olabilmek için 18 yaşını doldurmuş olmanız gerekmektedir.</li>
          <li>Kayıt sırasında verdiğiniz bilgilerin doğru ve güncel olmasından siz sorumlusunuz.</li>
          <li>Hesap güvenliğinizi (şifre vb.) korumak sizin sorumluluğunuzdadır.</li>
          <li>Bir kişi yalnızca bir hesap oluşturabilir.</li>
        </ul>
      </Section>

      <Section title="3. İlan Kuralları">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>İlanlarda yalnızca <strong>sahiplendirme</strong> veya <strong>çiftleştirme</strong> amacı belirtilebilir.</li>
          <li>Hayvan satışı, fiyat belirtilmesi veya pazarlık imasi yasaktır.</li>
          <li>Yanıltıcı veya sahte bilgi içeren ilanlar silinir, hesap askıya alınabilir.</li>
          <li>Fotoğraflar ilan sahibine ait veya kullanım hakkına sahip olmalıdır.</li>
          <li>Hayvanın sağlığı ile ilgili bilgiler doğru olarak verilmelidir.</li>
        </ul>
      </Section>

      <Section title="4. Abonelik ve Ödemeler">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ödemeler başlangıçta tahsil edilir ve iade edilmez.</li>
          <li>Paket kapsamındaki ilan haklarında süre sınırı yoktur.</li>
          <li>Silinen ilanlara ait öne çıkarma ve ilan hakları iade edilmez.</li>
        </ul>
      </Section>

      <Section title="5. Yasaklı Davranışlar">
        <p>Aşağıdaki davranışlar kesinlikle yasaktır:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Hayvan ticareti yapmak veya satış ilanı vermek</li>
          <li>Başkalarının kişisel bilgilerini izinsiz paylaşmak</li>
          <li>Platformu yasadışı amaçlarla kullanmak</li>
          <li>Spam, dolandırıcılık veya taciz içerikli mesajlar göndermek</li>
          <li>Platformun teknik altyapısına zarar vermek</li>
        </ul>
      </Section>

      <Section title="6. Sorumluluk Reddi">
        <p>
          PatiVar bir ilan platformudur. Kullanıcılar arasındaki iletişim, buluşma ve
          sahiplendirme süreçlerinde ortaya çıkabilecek sorunlardan platformumuz sorumlu değildir.
          Sahiplendirme öncesi gerekli özeni göstermeniz önerilir.
        </p>
      </Section>

      <Section title="7. İçerik Hakları">
        <p>
          İlan yayınlarken içeriğin kullanım haklarını PatiVar'e vermiş sayılırsınız.
          Platform, ilanları sosyal medya veya tanıtım materyallerinde kullanabilir.
        </p>
      </Section>

      <Section title="8. Değişiklikler">
        <p>
          Bu şartlar önceden bildirimde bulunulmaksızın değiştirilebilir. Değişiklikler
          yayınlandığı andan itibaren geçerlidir. Platformu kullanmaya devam etmeniz,
          güncel şartları kabul ettiğiniz anlamına gelir.
        </p>
      </Section>

      <Section title="9. İletişim">
        <p>
          Sorularınız için{' '}
          <Link to="/iletisim" className="text-peach-500 font-semibold hover:underline">
            iletişim sayfamızdan
          </Link>{' '}
          bize ulaşabilirsiniz.
        </p>
      </Section>
    </div>
  );
}
