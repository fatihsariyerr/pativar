#!/bin/bash
set -euo pipefail

# ==========================================
# PatiVar - Kubernetes Deployment Script
# ==========================================

REGISTRY="${REGISTRY:-ghcr.io/your-username}"
VERSION="${VERSION:-latest}"
NAMESPACE="pativar"

echo "🐾 PatiVar Kubernetes Deployment"
echo "=================================="
echo "Registry: $REGISTRY"
echo "Version:  $VERSION"
echo ""

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

step() { echo -e "${BLUE}[STEP]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# ==========================================
# 1. Build Docker images
# ==========================================
step "Docker image'ları build ediliyor..."

docker build -t ${REGISTRY}/pativar-api:${VERSION} ./backend
docker build -t ${REGISTRY}/pativar-frontend:${VERSION} \
  --build-arg VITE_API_URL=/api \
  ./frontend

success "Docker image'ları başarıyla build edildi"

# ==========================================
# 2. Push to registry
# ==========================================
step "Image'lar registry'ye push ediliyor..."

docker push ${REGISTRY}/pativar-api:${VERSION}
docker push ${REGISTRY}/pativar-frontend:${VERSION}

success "Image'lar push edildi"

# ==========================================
# 3. Create namespace
# ==========================================
step "Kubernetes namespace oluşturuluyor..."

kubectl apply -f k8s/00-namespace.yaml
success "Namespace oluşturuldu"

# ==========================================
# 4. Apply configs and secrets
# ==========================================
step "Config ve Secret'lar uygulanıyor..."

kubectl apply -f k8s/01-config.yaml
success "Config ve Secret'lar uygulandı"

# ==========================================
# 5. Create schema configmap
# ==========================================
step "Schema ConfigMap oluşturuluyor..."

kubectl create configmap pativar-schema \
  --from-file=schema.sql=backend/db/schema.sql \
  -n ${NAMESPACE} \
  --dry-run=client -o yaml | kubectl apply -f -

success "Schema ConfigMap oluşturuldu"

# ==========================================
# 6. Deploy PostgreSQL
# ==========================================
step "PostgreSQL deploy ediliyor..."

kubectl apply -f k8s/02-postgres.yaml
echo "  PostgreSQL'in hazır olması bekleniyor..."
kubectl rollout status statefulset/postgres -n ${NAMESPACE} --timeout=120s

success "PostgreSQL deploy edildi"

# ==========================================
# 7. Run DB migration
# ==========================================
step "Veritabanı migration çalıştırılıyor..."

kubectl delete job db-migrate -n ${NAMESPACE} --ignore-not-found
kubectl apply -f k8s/06-db-migrate.yaml
kubectl wait --for=condition=complete job/db-migrate -n ${NAMESPACE} --timeout=120s

success "Migration tamamlandı"

# ==========================================
# 8. Update image references and deploy API
# ==========================================
step "Backend API deploy ediliyor..."

# Update image in manifest
sed "s|pativar-api:latest|${REGISTRY}/pativar-api:${VERSION}|g" k8s/03-api.yaml | kubectl apply -f -
kubectl rollout status deployment/pativar-api -n ${NAMESPACE} --timeout=120s

success "Backend API deploy edildi"

# ==========================================
# 9. Deploy Frontend
# ==========================================
step "Frontend deploy ediliyor..."

sed "s|pativar-frontend:latest|${REGISTRY}/pativar-frontend:${VERSION}|g" k8s/04-frontend.yaml | kubectl apply -f -
kubectl rollout status deployment/pativar-frontend -n ${NAMESPACE} --timeout=120s

success "Frontend deploy edildi"

# ==========================================
# 10. Apply Ingress & Network Policies
# ==========================================
step "Ingress ve NetworkPolicy uygulanıyor..."

kubectl apply -f k8s/05-ingress.yaml

success "Ingress ve NetworkPolicy uygulandı"

# ==========================================
# Summary
# ==========================================
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 PatiVar başarıyla deploy edildi!${NC}"
echo "=========================================="
echo ""
echo "Servisler:"
kubectl get pods -n ${NAMESPACE} -o wide
echo ""
kubectl get svc -n ${NAMESPACE}
echo ""
kubectl get ingress -n ${NAMESPACE}
echo ""
echo "Port-forward ile test etmek için:"
echo "  kubectl port-forward svc/pativar-frontend 3000:3000 -n ${NAMESPACE}"
echo "  kubectl port-forward svc/pativar-api 3001:3001 -n ${NAMESPACE}"
echo ""
echo "Logları izlemek için:"
echo "  kubectl logs -f deployment/pativar-api -n ${NAMESPACE}"
echo "  kubectl logs -f deployment/pativar-frontend -n ${NAMESPACE}"
