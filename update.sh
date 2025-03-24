#!/bin/bash
# Script to update LinguaLearn on both web servers

# Define servers
WEB01="ubuntu@3.86.231.113"
WEB02="ubuntu@3.83.164.61"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to update on a web server
update_server() {
    SERVER=$1
    SERVER_NAME=$2
    
    echo -e "${YELLOW}Updating LinguaLearn on $SERVER_NAME...${NC}"
    
    # Check if server is reachable
    ssh -o ConnectTimeout=5 $SERVER "echo Server is reachable" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}Cannot connect to $SERVER_NAME. Please check your SSH connection.${NC}"
        return 1
    fi
    
    # Pull latest changes
    echo "Pulling latest changes from GitHub..."
    ssh $SERVER "cd lingua-learn && git pull"
    
    # Install dependencies if package.json changed
    echo "Checking if dependencies need to be updated..."
    ssh $SERVER "cd lingua-learn && git diff --name-only HEAD@{1} HEAD | grep -q 'package.json' && npm install || echo 'No dependency changes'"
    
    # Restart the application
    echo "Restarting the application..."
    ssh $SERVER "cd lingua-learn && pm2 restart lingua-learn"
    
    echo -e "${GREEN}Update completed on $SERVER_NAME.${NC}"
    return 0
}

echo -e "${GREEN}=== Starting LinguaLearn Update ===${NC}"

# Update web servers
update_server $WEB01 "Web Server 1 (web-01)"
WEB01_RESULT=$?

update_server $WEB02 "Web Server 2 (web-02)"
WEB02_RESULT=$?

# Summary
echo -e "${GREEN}=== Update Summary ===${NC}"

if [ $WEB01_RESULT -eq 0 ]; then
    echo -e "${GREEN}Web Server 1: Updated successfully${NC}"
else
    echo -e "${RED}Web Server 1: Update failed${NC}"
fi

if [ $WEB02_RESULT -eq 0 ]; then
    echo -e "${GREEN}Web Server 2: Updated successfully${NC}"
else
    echo -e "${RED}Web Server 2: Update failed${NC}"
fi

# Verify health
echo -e "${YELLOW}Checking application health...${NC}"
curl -s http://44.202.43.15/health || echo -e "${RED}Health check failed${NC}"

echo -e "${GREEN}Update process completed!${NC}"
