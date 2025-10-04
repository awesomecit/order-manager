#!/bin/bash

echo "🚀 Starting ORDER MANAGER Development Environment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎯 Starting all services with Watt...${NC}"

# Start Watt orchestration
watt start

echo -e "${GREEN}✅ Development environment ready!${NC}"