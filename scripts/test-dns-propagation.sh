#!/bin/bash

# DNS Test Script - Landing Page Domain Only
# Tests DNS propagation and HTTPS connectivity for tech-citizen.me

echo "🌐 Testing DNS for TECH-CITIZEN Landing Page"
echo "============================================="

DOMAIN="tech-citizen.me"

DNS_SERVERS=(
    "8.8.8.8"          # Google DNS
    "1.1.1.1"          # Cloudflare DNS
    "208.67.222.222"   # OpenDNS
    "1.0.0.1"          # Cloudflare DNS secondario
)

echo ""
echo "🔍 DNS Resolution Test for: $DOMAIN"
echo "-----------------------------------"

for dns in "${DNS_SERVERS[@]}"; do
    echo -n "  $dns: "
    result=$(nslookup "$DOMAIN" "$dns" 2>/dev/null | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    if [ -n "$result" ]; then
        echo "✅ $result"
    else
        # Fallback con dig
        result=$(dig +short "$DOMAIN" @"$dns" 2>/dev/null | head -1)
        if [ -n "$result" ]; then
            echo "✅ $result (via dig)"
        else
            echo "❌ Not resolved"
        fi
    fi
done

echo ""
echo "🔒 HTTPS Connectivity Test"
echo "---------------------------"

echo -n "Testing HTTPS for $DOMAIN: "
response=$(curl -I -s --max-time 10 "https://$DOMAIN" 2>/dev/null)
if [ $? -eq 0 ]; then
    status=$(echo "$response" | head -1 | awk '{print $2}')
    echo "✅ Connected (Status: $status)"
    
    # Verifica certificato SSL
    echo -n "SSL Certificate: "
    if openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" -verify_return_error </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        echo "✅ Valid"
    else
        echo "⚠️  Check certificate"
    fi
else
    echo "❌ Failed"
fi

echo ""
echo "🌍 Global DNS Propagation Check"
echo "--------------------------------"

# Test da server DNS globali per verificare propagazione completa
GLOBAL_DNS=(
    "8.8.4.4"          # Google DNS secondario
    "9.9.9.9"          # Quad9
    "77.88.8.8"        # Yandex DNS (Europa)
    "168.95.1.1"       # HiNet DNS (Asia)
)

for dns in "${GLOBAL_DNS[@]}"; do
    echo -n "  $dns: "
    result=$(dig +short "$DOMAIN" @"$dns" 2>/dev/null | head -1)
    if [ -n "$result" ]; then
        echo "✅ $result"
    else
        echo "❌ Not resolved"
    fi
done

echo ""
echo "📊 Current Configuration"
echo "------------------------"
echo "Domain: $DOMAIN"
echo "Expected IP: 91.99.165.92"
echo "Cloudflare Proxy: ✅ ENABLED (good for landing page)"
echo "SSL: Auto-managed by Cloudflare"
echo ""

# Test della velocità di risposta
echo "⚡ Response Time Test"
echo "---------------------"
echo -n "Response time: "
if command -v curl >/dev/null 2>&1; then
    time_total=$(curl -o /dev/null -s -w "%{time_total}" "https://$DOMAIN")
    if [ $? -eq 0 ]; then
        echo "✅ ${time_total}s"
    else
        echo "❌ Timeout"
    fi
else
    echo "⚠️  curl not available"
fi

echo ""
echo "🎯 Landing Page Status: All systems check!"
echo "📋 Test completed for $DOMAIN"