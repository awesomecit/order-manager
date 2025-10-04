# 🌐 Cloudflare DNS Configuration

## Current DNS Setup ✅

### Wildcard CNAME Record
```
Type: CNAME
Name: *.order-manager
Target: tech-citizen.me
Proxy Status: Proxied (Orange Cloud Active)
TTL: Automatic
```

## Domain Routing

With this configuration, all subdomains under `*.order-manager.tech-citizen.me` are automatically routed:

```
api.order-manager.tech-citizen.me → tech-citizen.me → manager.tech-citizen.me:3000
app.order-manager.tech-citizen.me → tech-citizen.me → manager.tech-citizen.me:5173  
dev.order-manager.tech-citizen.me → tech-citizen.me → manager.tech-citizen.me:6006
```

## Cloudflare Benefits

### 🛡️ Security
- DDoS protection automatically enabled
- Web Application Firewall (WAF) available
- SSL/TLS encryption managed by Cloudflare

### ⚡ Performance  
- Global CDN with edge caching
- Automatic HTTP/2 and HTTP/3 support
- Image optimization and compression

### 🔧 Configuration Options
- Custom rules for routing
- Rate limiting per subdomain
- Analytics and monitoring

## Next Steps

1. **Deploy Production Environment**
   ```bash
   # On manager.tech-citizen.me
   cd /opt/order-manager
   docker-compose -f docker-compose.production.yml up -d
   ```

2. **Verify DNS Resolution**
   ```bash
   # Test from external location
   nslookup api.order-manager.tech-citizen.me
   curl -I https://api.order-manager.tech-citizen.me/health
   ```

3. **Configure Nginx for Multi-Domain**
   - Update nginx.conf for proper subdomain routing
   - Setup SSL certificates via Let's Encrypt
   - Configure proxy_pass rules

## Environment Variables for Production

```env
# Gateway Configuration
GATEWAY_HOST=0.0.0.0
GATEWAY_PORT=3000
NODE_ENV=production

# CORS Configuration  
CORS_ORIGIN=https://app.order-manager.tech-citizen.me,https://dev.order-manager.tech-citizen.me

# Database
DATABASE_URL=postgresql://orderuser:${DB_PASSWORD}@postgres:5432/orderdb

# Redis
REDIS_URL=redis://redis:6379

# RabbitMQ
RABBITMQ_URL=amqp://orderuser:${RABBITMQ_PASSWORD}@rabbitmq:5672
```

## Testing DNS Configuration

### 1. Basic DNS Resolution
```bash
# Should resolve to Cloudflare IPs
dig api.order-manager.tech-citizen.me
dig app.order-manager.tech-citizen.me
dig dev.order-manager.tech-citizen.me
```

### 2. HTTP/HTTPS Connectivity
```bash
# Test API Gateway
curl -v https://api.order-manager.tech-citizen.me/health

# Test with custom headers
curl -H "Origin: https://app.order-manager.tech-citizen.me" \
     https://api.order-manager.tech-citizen.me/health
```

### 3. SSL Certificate Validation
```bash
# Check SSL certificate chain
openssl s_client -connect api.order-manager.tech-citizen.me:443 -servername api.order-manager.tech-citizen.me
```

## Troubleshooting

### Common Issues
1. **502 Bad Gateway**: Backend service not running
2. **SSL Certificate Error**: Let's Encrypt setup needed  
3. **CORS Error**: Update CORS_ORIGIN environment variable
4. **DNS Propagation**: Wait up to 24 hours for global propagation

### Debug Commands
```bash
# Check Docker services
docker-compose -f docker-compose.production.yml ps

# Check logs
docker-compose -f docker-compose.production.yml logs gateway

# Test internal connectivity
docker exec order-manager-gateway curl localhost:3000/health
```