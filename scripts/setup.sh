#!/bin/bash

set -e

echo "🚀 Setting up ORDER MANAGER - Task A: Environment Setup"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ is required (found v$NODE_VERSION)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"

# Step 2: Install Watt CLI
echo -e "${BLUE}📦 Installing Platformatic Watt CLI...${NC}"
npm install -g @platformatic/cli

# Step 3: Install root dependencies
echo -e "${BLUE}📦 Installing project dependencies...${NC}"
npm install

echo -e "${GREEN}🎉 Basic setup completed!${NC}"
echo ""
echo -e "${BLUE}📍 Next steps:${NC}"
echo "  1. Continue with individual workspace setup"
echo "  2. Run setup for each component as we create them"