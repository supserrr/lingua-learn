# Deployment Instructions for LinguaLearn

This document outlines the steps to deploy the LinguaLearn application to web servers and configure the load balancer.

## Server Details

- Web Server 1: 6485-web-01 (3.86.231.113)
- Web Server 2: 6485-web-02 (3.83.164.61)
- Load Balancer: 6485-lb-01 (44.202.43.15)
- Username: ubuntu

## Prerequisites

Before starting deployment, ensure you have:
- SSH access to all servers
- Git installed on your local machine
- A GitHub account to push your code

## 1. Prepare Your Code Repository

1. Create a GitHub repository for your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/lingua-learn.git
   git push -u origin master
   ```

## 2. Deploy to Web Servers

### Web Server 1 (web-01)

1. SSH into the server:
   ```bash
   ssh ubuntu@3.86.231.113
   ```

2. Install Node.js and npm if not already installed:
   ```bash
   curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/lingua-learn.git
   cd lingua-learn
   ```

4. Create `.env` file:
   ```bash
   cat > .env << EOF
   PORT=3000
   RAPIDAPI_KEY=1bac348c61msh514a66a69096841p154653jsn03abaa71adb2
   SERVER_NAME=web01
   EOF
   ```

5. Install dependencies:
   ```bash
   npm install
   ```

6. Install PM2 to manage the Node.js process:
   ```bash
   sudo npm install -g pm2
   ```

7. Start the application with PM2:
   ```bash
   pm2 start backend/server.js --name lingua-learn
   pm2 save
   pm2 startup
   ```

8. Configure PM2 to restart on server reboot:
   ```bash
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
   ```

### Web Server 2 (web-02)

1. SSH into the server:
   ```bash
   ssh ubuntu@3.83.164.61
   ```

2. Follow the same steps as Web Server 1, but set the SERVER_NAME to "web02" in the .env file.

## 3. Configure the Load Balancer

1. SSH into the load balancer:
   ```bash
   ssh ubuntu@44.202.43.15
   ```

2. Install Nginx:
   ```bash
   sudo apt update
   sudo apt install -y nginx
   ```

3. Create Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/lingua-learn
   ```

4. Add the following configuration:
   ```nginx
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
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /health {
           proxy_pass http://lingua_servers/health;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/lingua-learn /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default
   ```

6. Test Nginx configuration:
   ```bash
   sudo nginx -t
   ```

7. Restart Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

## 4. Verify Deployment

1. Access the application through the load balancer:
   ```
   http://44.202.43.15
   ```

2. Test that both servers are receiving traffic by checking the logs:
   ```bash
   # On web-01
   ssh ubuntu@3.86.231.113
   cd lingua-learn
   pm2 logs lingua-learn

   # On web-02
   ssh ubuntu@3.83.164.61
   cd lingua-learn
   pm2 logs lingua-learn
   ```

3. Test that the load balancer is working by temporarily stopping the application on one server:
   ```bash
   # On web-01
   ssh ubuntu@3.86.231.113
   pm2 stop lingua-learn

   # Then verify all traffic goes to web-02
   # Then restart web-01
   pm2 start lingua-learn
   ```

## 5. Create Demo Video

Create a short (less than 2 minutes) demo video showing:

1. The application's main features
2. How to translate text and get pronunciation
3. How to save words to vocabulary
4. Accessing the application through the load balancer
5. Brief explanation of your load balancer configuration

Upload the video to YouTube or another platform and include the link in your README.md.

## Troubleshooting

### Common Issues

1. **Application not loading**:
   - Check if the Node.js servers are running: `pm2 status`
   - Check for errors in the logs: `pm2 logs lingua-learn`
   - Verify that the application port (3000) is open in any firewalls

2. **Load balancer not distributing traffic**:
   - Verify Nginx is running: `sudo systemctl status nginx`
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify the web servers are accessible directly: `curl http://3.86.231.113:3000/health`

3. **API calls failing**:
   - Check if the RAPIDAPI_KEY is correct in your .env files
   - Verify API endpoints are correctly configured in the code
   - Check for CORS issues in the browser developer console

## Maintenance

### Updating the Application

To update the application after making code changes:

1. Push the changes to GitHub
2. On each web server:
   ```bash
   cd lingua-learn
   git pull
   npm install   # if dependencies changed
   pm2 restart lingua-learn
   ```

### Monitoring

To monitor the application:

1. Check PM2 status on web servers:
   ```bash
   pm2 monit
   ```

2. Check Nginx access logs on the load balancer:
   ```bash
   sudo tail -f /var/log/nginx/access.log
   ```

## Security Considerations

For a production deployment, consider:

1. Setting up HTTPS with Let's Encrypt
2. Implementing rate limiting in Nginx
3. Using a more secure way to manage environment variables
4. Setting up firewall rules to restrict access to server ports
