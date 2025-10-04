#!/bin/bash

# 🌐 Test DNS Configuration for ORDER MANAGER
# Verify Cloudflare wildcard CNAME setup

echo "🔍 Testing DNS Configuration for *.order-manager.tech-citizen.me"
echo "=================================================="

# Test domains
DOMAINS=(
    "api.order-manager.tech-citizen.me"
    "app.order-manager.tech-citizen.me" 
    "dev.order-manager.tech-citizen.me"
)

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${YELLOW}1. DNS Resolution Test${NC}"
for domain in "${DOMAINS[@]}"; do
    echo -n "Testing $domain... "
    if nslookup $domain >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Resolved${NC}"
    else
        echo -e "${RED}❌ Failed${NC}"
    fi
done

echo -e "\n${YELLOW}2. HTTP Connectivity Test${NC}"
for domain in "${DOMAINS[@]}"; do
    echo -n "Testing HTTPS $domain... "
    if curl -s -o /dev/null -w "%{http_code}" "https://$domain" | grep -q "200\|404\|502"; then
        echo -e "${GREEN}✅ Reachable${NC}"
    else
        echo -e "${RED}❌ Unreachable${NC}"
    fi
done

echo -e "\n${YELLOW}3. SSL Certificate Test${NC}"
for domain in "${DOMAINS[@]}"; do
    echo -n "Testing SSL for $domain... "
    if echo | timeout 5 openssl s_client -connect $domain:443 -servername $domain 2>/dev/null | grep -q "Verify return code: 0"; then
        echo -e "${GREEN}✅ Valid SSL${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL Pending${NC}"
    fi
done

echo -e "\n${YELLOW}4. Cloudflare Proxy Test${NC}"
for domain in "${DOMAINS[@]}"; do
    echo -n "Testing CF proxy for $domain... "
    if dig +short $domain | grep -E "104\.16\.|104\.17\.|172\.64\.|172\.65\.|172\.66\.|172\.67\." >/dev/null; then
        echo -e "${GREEN}✅ Proxied${NC}"
    else
        echo -e "${YELLOW}⚠️  Direct${NC}"
    fi
done

echo -e "\n=================================================="
echo -e "${GREEN}✅ DNS Configuration Test Complete${NC}"
echo -e "\nNext steps:"
echo "1. Deploy production environment: docker-compose -f docker-compose.production.yml up -d"
echo "2. Test API endpoints: curl https://api.order-manager.tech-citizen.me/health"
echo "3. Monitor logs: docker-compose -f docker-compose.production.yml logs -f"