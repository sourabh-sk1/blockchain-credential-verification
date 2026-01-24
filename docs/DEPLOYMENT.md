# Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Heroku Deployment (Backend)](#heroku-deployment-backend)
4. [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
5. [Production Environment](#production-environment)
6. [Hyperledger Fabric Setup](#hyperledger-fabric-setup)

## Local Development

### Prerequisites
- Node.js v18+
- Docker & Docker Compose
- MongoDB
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd project3
```

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### Step 3: Start MongoDB
```bash
docker run -d \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -p 27017:27017 \
  --name credential-mongodb \
  mongo:6.0
```

### Step 4: Configure Environment Variables

**Backend** (`.env`):
```env
BACKEND_PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://admin:password123@localhost:27017/academic-credentials
JWT_SECRET=your_secret_key_change_in_production
CORS_ORIGIN=http://localhost:3000
FABRIC_CHANNEL_NAME=credential-channel
FABRIC_CHAINCODE_NAME=credential-contract
```

**Frontend** (`.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NETWORK_NAME=local-fabric
```

### Step 5: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App on http://localhost:3000
```

### Step 6: Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## Docker Deployment

### Using Docker Compose

```bash
# Build all services
docker-compose -f docker/docker-compose.yml build

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down

# Remove volumes (data deletion)
docker-compose -f docker/docker-compose.yml down -v
```

### Service Ports
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- IPFS: http://localhost:5001 (API), http://localhost:8080 (Gateway)

## Heroku Deployment (Backend)

### Prerequisites
- Heroku CLI installed
- Git repository initialized
- Heroku account

### Step 1: Create Heroku App
```bash
heroku login
heroku create credential-api
```

### Step 2: Add Buildpack
```bash
heroku buildpacks:add heroku/nodejs
```

### Step 3: Set Environment Variables
```bash
heroku config:set BACKEND_PORT=5000
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=<your-mongodb-url>
heroku config:set JWT_SECRET=<generate-strong-secret>
heroku config:set CORS_ORIGIN=<your-frontend-url>
heroku config:set FABRIC_CA_URL=<your-fabric-ca-url>
heroku config:set FABRIC_PEER_URL=<your-peer-url>
heroku config:set FABRIC_ORDERER_URL=<your-orderer-url>
```

### Step 4: Configure Procfile
Create `backend/Procfile`:
```
web: npm start
```

### Step 5: Deploy
```bash
# Deploy from backend directory
cd backend
git subtree push --prefix backend heroku main

# Or from root (if using monorepo)
git push heroku main
```

### Step 6: View Logs
```bash
heroku logs --tail
```

### Step 7: Monitor Application
```bash
heroku ps
heroku metrics
```

## Vercel Deployment (Frontend)

### Prerequisites
- Vercel CLI installed
- GitHub account with repo
- Vercel account

### Step 1: Configure Vercel Project

Create `frontend/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "env": {
    "REACT_APP_API_URL": "@api_url"
  }
}
```

### Step 2: Deploy via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

### Step 3: Set Environment Variables in Dashboard
1. Go to Vercel Dashboard
2. Select project
3. Settings → Environment Variables
4. Add:
   - `REACT_APP_API_URL`: Your backend URL
   - `REACT_APP_NETWORK_NAME`: local-fabric

### Step 4: Deploy via GitHub
```bash
# Connect GitHub repo to Vercel
# Vercel auto-deploys on git push
git push origin main
```

### Step 5: Custom Domain
1. Vercel Dashboard → Settings → Domains
2. Add custom domain
3. Configure DNS records

## Production Environment

### Security Considerations

1. **Environment Variables**
   ```bash
   # Use secure secret management
   - AWS Secrets Manager
   - HashiCorp Vault
   - Environment variable encryption
   ```

2. **SSL/TLS Certificates**
   ```bash
   # Use Let's Encrypt or AWS Certificate Manager
   - Enable HTTPS everywhere
   - Use security headers
   ```

3. **Database Security**
   ```bash
   - Enable MongoDB authentication
   - Use VPC/Network isolation
   - Enable encryption at rest
   - Regular backups
   ```

4. **API Security**
   ```bash
   - Rate limiting
   - CORS configuration
   - CSRF protection
   - API key rotation
   ```

5. **Monitoring & Logging**
   ```bash
   - Application logging (Winston)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)
   - Security audit logs
   ```

### Database Migration for Production

```bash
# MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Create cluster
3. Configure IP whitelist
4. Generate connection string
5. Update MONGODB_URI

Connection String Format:
mongodb+srv://username:password@cluster.mongodb.net/database
```

### SSL Certificate Setup

```bash
# Using Let's Encrypt with Nginx
certbot certonly --standalone -d yourdomain.com

# Update Nginx config
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

### CI/CD Pipeline

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: credential-api
          heroku_email: ${{secrets.HEROKU_EMAIL}}
          appdir: backend

  frontend-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@master
        with:
          vercel-token: ${{secrets.VERCEL_TOKEN}}
          vercel-org-id: ${{secrets.VERCEL_ORG_ID}}
          vercel-project-id: ${{secrets.VERCEL_PROJECT_ID}}
          working-directory: frontend
```

## Hyperledger Fabric Setup

### Prerequisites
- Docker & Docker Compose
- Hyperledger Fabric samples

### Step 1: Download Fabric Samples
```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.0
cd fabric-samples
```

### Step 2: Start Fabric Network
```bash
cd test-network
./network.sh up createChannel -c credential-channel -ca
```

### Step 3: Deploy Chaincode
```bash
./network.sh deployCC -ccn credential-contract \
  -ccp ../chaincode-go \
  -ccl go
```

### Step 4: Configure Connection Profile
Update `backend/blockchain/hyperledger-fabric/network.json` with:
- Peer endpoints
- Orderer endpoints
- CA endpoints
- Channel name

### Step 5: Enroll Users
```bash
cd backend/blockchain/hyperledger-fabric
node enrollment.js
```

### Step 6: Test Chaincode
```bash
./network.sh invokeCC -C credential-channel \
  -N credential-contract \
  -c '{"Args":["initLedger"]}'
```

## Monitoring & Maintenance

### Application Health Checks
```bash
# Health endpoint
curl http://localhost:5000/health

# Database connectivity
curl http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Log Monitoring
```bash
# Backend logs (Docker)
docker logs credential-backend -f

# Application logs
tail -f logs/combined.log
```

### Database Maintenance
```bash
# MongoDB backup
mongodump --uri="mongodb://..." --archive=backup.archive

# MongoDB restore
mongorestore --archive=backup.archive
```

### Scaling Considerations
- Use load balancer for multiple backend instances
- Database replication for high availability
- CDN for frontend static assets
- Caching layer (Redis) for frequently accessed data

---

**Last Updated**: December 2024
