FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S pativar -u 1001 -G nodejs && \
    chown -R pativar:nodejs /app

USER pativar

EXPOSE 3001

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3001/health',(r)=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>process.exit(r.statusCode===200?0:1))}).on('error',()=>process.exit(1))"

CMD ["node", "src/index.js"]
