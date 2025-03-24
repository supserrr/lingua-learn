#!/bin/bash
# Deployment script for LinguaLearn

# Define servers
WEB01="ubuntu@3.86.231.113"
WEB02="ubuntu@3.83.164.61"
LB01="ubuntu@44.202.43.15"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to deploy to web servers
deploy_to_web_server() {
    SERVER=$1
    SERVER_NAME=$2
    
    echo -e "${YELLOW}Deploying to $SERVER_NAME...${NC}"
    
    # Check if server is reachable
    ssh -o ConnectTimeout=5 $SERVER "echo Server is reachable" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}Cannot connect to $SERVER_NAME. Please check your SSH connection.${NC}"
        return 1
    fi
    
    # Install Node.js if not already installed
    echo "Checking for Node.js..."
    ssh $SERVER "which node || (curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash - && sudo apt-get install -y nodejs)"
    
    # Clone or update repository
    echo "Cloning/updating repository..."
    ssh $SERVER "[ -d 'lingua-learn' ] && (cd lingua-learn && git pull) || git clone https://github.com/yourusername/lingua-learn.git"
    
    # Create .env file
    echo "Setting up environment variables..."
    ssh $SERVER "cd lingua-learn && cat > .env << EOF
PORT=3000
RAPIDAPI_KEY=1bac348c61msh514a66a69096841p154653jsn03abaa71adb2
SERVER_NAME=$SERVER_NAME
EOF"
    
    # Install dependencies
    echo "Installing dependencies..."
    ssh $SERVER "cd lingua-learn && npm install"
    
    # Install PM2 if not already installed
    echo "Checking for PM2..."
    ssh $SERVER "which pm2 || sudo npm install -g pm2"
    
    # Start or restart the application
    echo "Starting/restarting application..."
    ssh $SERVER "cd lingua-learn && pm2 describe lingua-learn > /dev/null && pm2 restart lingua-learn || pm2 start backend/server.js --name lingua-learn"
    
    # Save PM2 process list and generate startup script
    echo "Configuring PM2 to start on boot..."
    ssh $SERVER "pm2 save && sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu"
    
    echo -e "${GREEN}Deployment to $SERVER_NAME completed successfully.${NC}"
    return 0
}

# Function to configure the load balancer
configure_load_balancer() {
    echo -e "${YELLOW}Configuring load balancer...${NC}"
    
    # Check if server is reachable
    ssh -o ConnectTimeout=5 $LB01 "echo Server is reachable" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo -e "${RED}Cannot connect to load balancer. Please check your SSH connection.${NC}"
        return 1
    fi
    
    # Install Nginx if not already installed
    echo "Checking for Nginx..."
    ssh $LB01 "which nginx || sudo apt update && sudo apt install -y nginx"
    
    # Create Nginx configuration
    echo "Creating Nginx configuration..."
    ssh $LB01 "sudo bash -c 'cat > /etc/nginx/sites-available/lingua-learn << EOF
upstream lingua_servers {
    server 3.86.231.113:3000 max_fails=3 fail_timeout=30s;
    server 3.83.164.61:3000 max_fails=3 fail_timeout=30s;
    least_conn;
}

server {
    listen 80;
    server_name 44.202.43.15;

    location / {
        proxy_pass http://lingua_servers;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        proxy_pass http://lingua_servers/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF'"
    
    # Enable the site
    echo "Enabling the site..."
    ssh $LB01 "sudo ln -sf /etc/nginx/sites-available/lingua-learn /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default"
    
    # Test and restart Nginx
    echo "Testing and restarting Nginx..."
    ssh $LB01 "sudo nginx -t && sudo systemctl restart nginx"
    
    echo -e "${GREEN}Load balancer configuration completed successfully.${NC}"
    return 0
}

# Main script execution

echo -e "${GREEN}=== Starting LinguaLearn Deployment ===${NC}"

# Deploy to web servers
deploy_to_web_server $WEB01 "web01"
WEB01_RESULT=$?

deploy_to_web_server $WEB02 "web02"
WEB02_RESULT=$?

# Configure load balancer
configure_load_balancer
LB_RESULT=$?

# Summary
echo -e "${GREEN}=== Deployment Summary ===${NC}"

if [ $WEB01_RESULT -eq 0 ]; then
    echo -e "${GREEN}Web Server 1: Deployed successfully${NC}"
else
    echo -e "${RED}Web Server 1: Deployment failed${NC}"
fi

if [ $WEB02_RESULT -eq 0 ]; then
    echo -e "${GREEN}Web Server 2: Deployed successfully${NC}"
else
    echo -e "${RED}Web Server 2: Deployment failed${NC}"
fi

if [ $LB_RESULT -eq 0 ]; then
    echo -e "${GREEN}Load Balancer: Configured successfully${NC}"
else
    echo -e "${RED}Load Balancer: Configuration failed${NC}"
fi

# Verify deployment
if [ $WEB01_RESULT -eq 0 ] && [ $WEB02_RESULT -eq 0 ] && [ $LB_RESULT -eq 0 ]; then
    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${YELLOW}You can access your application at:${NC} http://44.202.43.15"
else
    echo -e "${RED}Deployment completed with errors. Please check the logs above.${NC}"
fi