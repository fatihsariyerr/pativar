# 🐾 PatiVar - Kedi & Köpek İlan Platformu

Türkiye'nin en sevimli kedi ve köpek ilan platformu. Evcil hayvan sahiplendirme, satış ve çiftleştirme ilanları yayınlayın.

## 🏗 Mimari

```
┌─────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                     │
│                                                          │
│  ┌──────────┐    ┌───────────────┐    ┌──────────────┐  │
│  │  Ingress  │───▶│   Frontend    │    │  PostgreSQL   │  │
│  │  (nginx)  │    │  (React+Nginx)│    │  (StatefulSet)│  │
│  │           │    │  Replicas: 2  │    │  Replicas: 1  │  │
│  │           │    └───────────────┘    └──────┬───────┘  │
│  │           │    ┌───────────────┐           │          │
│  │           │───▶│  Backend API  │───────────┘          │
│  │           │    │  (Express.js) │                      │
│  │           │    │  Replicas: 2  │                      │
│  └──────────┘    └───────────────┘                      │
│                                                          │
│  NetworkPolicy: DB yalnızca API tarafından erişilebilir  │
│  HPA: CPU %70 üzerinde otomatik ölçekleme                │
│  PDB: Her zaman min 1 pod çalışır                        │
└─────────────────────────────────────────────────────────┘
```

## 📦 Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js, JWT Auth, express-validator |
| Veritabanı | PostgreSQL 16 (UUID, triggers, views) |
| Container | Docker, Docker Compose |
| Orkestrasyon | Kubernetes (Deployment, StatefulSet, HPA, PDB, NetworkPolicy) |
| Proxy | Nginx (SPA routing, API proxy, gzip, caching) |

## 🚀 Hızlı Başlangıç

### Docker Compose ile (Geliştirme)

```bash
# Repo'yu klonla
git clone https://github.com/username/pativar.git
cd pativar

# Tüm servisleri başlat
docker-compose up --build

# Uygulamayı aç
open http://localhost:3000
```

### Manuel Kurulum

```bash
# 1. PostgreSQL'i başlat ve schema'yı çalıştır
psql -U postgres -c "CREATE DATABASE pativar; CREATE USER pativar WITH PASSWORD 'pativar123'; GRANT ALL ON DATABASE pativar TO pativar;"
psql -U pativar -d pativar -f backend/db/schema.sql

# 2. Backend'i başlat
cd backend
cp .env.example .env  # Düzenle
npm install
npm start

# 3. Frontend'i başlat
cd frontend
npm install
npm run dev
```

## ☸️ Kubernetes Deployment

### Ön Gereksinimler
- Kubernetes cluster (1.25+)
- kubectl yapılandırılmış
- Nginx Ingress Controller
- cert-manager (TLS için, opsiyonel)
- Container registry erişimi

### Deployment Adımları

```bash
# 1. Image'ları build et ve push et
export REGISTRY=ghcr.io/username
export VERSION=v1.0.0

docker build -t $REGISTRY/pativar-api:$VERSION ./backend
docker build -t $REGISTRY/pativar-frontend:$VERSION --build-arg VITE_API_URL=/api ./frontend
docker push $REGISTRY/pativar-api:$VERSION
docker push $REGISTRY/pativar-frontend:$VERSION

# 2. K8s manifest'lerindeki image referanslarını güncelle
# k8s/03-api.yaml ve k8s/04-frontend.yaml içindeki image alanlarını düzenle

# 3. Sırasıyla uygula
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-config.yaml
kubectl apply -f k8s/02-postgres.yaml

# 4. Schema ConfigMap oluştur
kubectl create configmap pativar-schema \
  --from-file=schema.sql=backend/db/schema.sql -n pativar

# 5. Migration çalıştır
kubectl apply -f k8s/06-db-migrate.yaml
kubectl wait --for=condition=complete job/db-migrate -n pativar

# 6. API ve Frontend deploy et
kubectl apply -f k8s/03-api.yaml
kubectl apply -f k8s/04-frontend.yaml
kubectl apply -f k8s/05-ingress.yaml

# Veya tek komutla:
chmod +x deploy.sh
REGISTRY=ghcr.io/username VERSION=v1.0.0 ./deploy.sh
```

### Port-Forward ile Test

```bash
kubectl port-forward svc/pativar-frontend 3000:3000 -n pativar
kubectl port-forward svc/pativar-api 3001:3001 -n pativar
```

## 📁 Proje Yapısı

```
pativar/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Navbar, Footer, PetCard, LoadingSpinner
│   │   ├── pages/            # Home, Listings, ListingDetail, CreateListing, Login, Register, Profile, Favorites
│   │   ├── hooks/            # useAuth
│   │   ├── utils/            # api.js (axios)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── backend/                  # Express API
│   ├── src/
│   │   ├── routes/           # auth, listings, users, breeds, subscriptions, favorites, messages, uploads
│   │   ├── middleware/        # auth, errorHandler
│   │   ├── utils/            # db.js
│   │   └── index.js
│   ├── db/
│   │   └── schema.sql        # Tüm tablolar, indexler, trigger'lar, seed data
│   ├── Dockerfile
│   └── package.json
├── k8s/                      # Kubernetes Manifests
│   ├── 00-namespace.yaml
│   ├── 01-config.yaml        # ConfigMap + Secrets
│   ├── 02-postgres.yaml      # StatefulSet + PVC + Service
│   ├── 03-api.yaml           # Deployment + HPA + PDB + Service
│   ├── 04-frontend.yaml      # Deployment + HPA + PDB + Service
│   ├── 05-ingress.yaml       # Ingress + NetworkPolicy
│   └── 06-db-migrate.yaml    # Migration Job
├── docker-compose.yml        # Local development
├── deploy.sh                 # K8s deployment script
└── README.md
```

## 🗄 Veritabanı Şeması

### Tablolar
- **users** - Kullanıcılar (telefon numarası UNIQUE)
- **subscriptions** - Abonelik planları (free: 1 ilan, basic: 5, premium: 20, business: 100)
- **listings** - İlanlar (kedi/köpek, satılık/sahiplendirme/çiftleştirme)
- **cat_details** - Kedi detayları (cins, FIV/FeLV, kum eğitimi, göz rengi...)
- **dog_details** - Köpek detayları (boyut, enerji, havlama, tasma eğitimi...)
- **cat_breeds** / **dog_breeds** - Cins listesi (Türk cinsleri dahil)
- **listing_images** - İlan fotoğrafları
- **favorites** - Favoriler
- **messages** - Mesajlaşma
- **reports** - Şikayetler
- **audit_log** - İşlem logları

### Trigger'lar
- Kullanıcı kaydında otomatik ücretsiz abonelik oluşturma
- İlan yayınlandığında `listings_used` sayacı artırma
- `updated_at` alanları otomatik güncelleme

## 🔑 İş Kuralları

1. **Telefon Numarası Tekliği**: Aynı telefon numarası ile yalnızca 1 hesap açılabilir
2. **İlk Abonelik**: Kayıt olan her kullanıcıya otomatik 1 ücretsiz ilan hakkı tanınır
3. **İlan Limiti**: Abonelik planına göre ilan limiti kontrol edilir
4. **30 Gün Geçerlilik**: İlanlar 30 gün sonra otomatik sona erer

## 🔐 API Endpoints

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | /api/auth/register | ❌ | Kayıt ol |
| POST | /api/auth/login | ❌ | Giriş yap |
| GET | /api/auth/me | ✅ | Profil bilgisi |
| GET | /api/listings | ❌ | İlanları listele (filtre destekli) |
| GET | /api/listings/:id | ❌ | İlan detayı |
| POST | /api/listings | ✅ | Yeni ilan oluştur |
| PUT | /api/listings/:id | ✅ | İlan güncelle |
| DELETE | /api/listings/:id | ✅ | İlan sil |
| GET | /api/breeds/cats | ❌ | Kedi cinsleri |
| GET | /api/breeds/dogs | ❌ | Köpek cinsleri |
| GET | /api/subscriptions/plans | ❌ | Abonelik planları |
| POST | /api/subscriptions/upgrade | ✅ | Plan yükselt |
| GET | /api/favorites | ✅ | Favorileri listele |
| POST | /api/favorites/:id | ✅ | Favoriye ekle |
| DELETE | /api/favorites/:id | ✅ | Favoriden kaldır |
| POST | /api/uploads | ✅ | Fotoğraf yükle |

## 📝 Lisans

MIT License
