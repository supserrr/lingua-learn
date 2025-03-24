#!/bin/bash
# Health check script for LinguaLearn

# Define servers
WEB01="3.86.231.113"
WEB02="3.83.164.61"
LB01="44.202.43.15"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking health of LinguaLearn servers...${NC}"

# Function to check server health
check_server() {
    SERVER=$1
    NAME=$2
    PORT=$3
    
    echo -e "${YELLOW}Checking $NAME at $SERVER:$PORT...${NC}"
    
    # Check if server is up
    curl -s -o /dev/null -w "%{http_code}" http://$SERVER:$PORT/health > /dev/null 2>&1
    STATUS=$?
    
    if [ $STATUS -eq 0 ]; then
        # Get detailed health information
        HEALTH=$(curl -s http://$SERVER:$PORT/health)
        echo -e "${GREEN}$NAME is UP${NC}"
        echo "Health details: $HEALTH"
    else
        echo -e "${RED}$NAME is DOWN${NC}"
    fi
    
    echo ""
}

# Check web servers
check_server $WEB01 "Web Server 1" 3000
check_server $WEB02 "Web Server 2" 3000

# Check if load balancer is distributing traffic
echo -e "${YELLOW}Checking load balancer distribution...${NC}"

# Make multiple requests to the load balancer and count responses
TOTAL=10
WEB01_COUNT=0
WEB02_COUNT=0
ERROR_COUNT=0

for (( i=1; i<=$TOTAL; i++ ))
do
    RESPONSE=$(curl -s http://$LB01/health)
    if [[ $RESPONSE == *"web01"* ]]; then
        WEB01_COUNT=$((WEB01_COUNT + 1))
    elif [[ $RESPONSE == *"web02"* ]]; then
        WEB02_COUNT=$((WEB02_COUNT + 1))
    else
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
done

echo "Load balancer test results ($TOTAL requests):"
echo "Web Server 1 received: $WEB01_COUNT requests"
echo "Web Server 2 received: $WEB02_COUNT requests"
echo "Errors: $ERROR_COUNT requests"

if [ $ERROR_COUNT -eq 0 ] && [ $WEB01_COUNT -gt 0 ] && [ $WEB02_COUNT -gt 0 ]; then
    echo -e "${GREEN}Load balancer is correctly distributing traffic.${NC}"
elif [ $ERROR_COUNT -eq 0 ] && ([ $WEB01_COUNT -eq 0 ] || [ $WEB02_COUNT -eq 0 ]); then
    echo -e "${YELLOW}Load balancer is working but only sending traffic to one server.${NC}"
else
    echo -e "${RED}Load balancer distribution test failed.${NC}"
fi
