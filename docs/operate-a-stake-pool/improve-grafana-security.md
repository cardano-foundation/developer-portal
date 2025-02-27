---
id: improve-grafana-security
title: Improve Grafana Security
sidebar_label: Improve Grafana Security
description: "Stake pool guide: Learn how to harden Grafana Security with SSL, 2FA"
image: ../img/og/og-developer-portal.png
---

Once your Grafana Server is installed, up and running, you can drastically improve its security and accessibility by installing an SSL Reverse Proxy, and enabling 2-Factor Authentication with Google OAuth.

## Prerequisites

NGINX Reverse Proxy :
- You must have a proper domain name; and FQDN set to your grafana’s public IP address
- You can buy a domain name basically on any hosting site like namecheap.

2FA Google OAuth : 
- You need to have your own domain mail address (and of course a secure mail server). For example, you could have "grafana@yourdomain.com"
- You need to create a Google account with this mail address.

## Nginx Reverse Proxy

The main issue if you want to access your Grafana Dashboard from anywhere, out-of-the-box, is that you have to expose the application port (http:3000 by default) on the public address of your server. To avoid that, a popular solution is to simply create an SSH tunnel with a port forwarding option to your Grafana Server. A more elegant and still secure solution is to configure a reverse proxy, with an SSL certificate.

### Nginx installation

**Install nginx**
```shell
sudo apt install nginx
```

**Check nginx status**
```shell
sudo systemctl status nginx
```

**Create Firewall Rules on your server**

Ports 80 and 443 need to be opened on your Grafana server. Nginx will automatically forward any HTTP requests to HTTPS, but it’s important to have both open, in order for Certbot to renew your SSL certificate every 3 month. Here is an example with UFW : deny any incoming connections, except SSH, HTTP and HTTPS, an allow any outgoing connections. Modify to suit your needs, especially if you are running Grafana on a Stake Pool Relay server, you'll need to add Cardano Port.
```shell
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Now you should be able to visit your server's public IP address : http://your-ip-address which should lead to the default Nginx page.

**Create and edit an nginx config file for your Grafana server**

(change with your actual FQDN like grafana.yourdomain.com)
```shell
cd /etc/nginx/sites-enabled
sudo nano <your FQDN>.conf
```
Add this block
```shell
server { 
listen 80;
server_name <your FQDN>;

location / {
proxy_set_header Host $http_host;
proxy_pass http://localhost:3000/;
} 
}
```

**Save your file and restart Nginx**
```shell
sudo systemctl restart nginx
```

Now access your monitoring server http://your-FQDN : you should see the Grafana login page.

**Nginx cleanup : remove the default enabled site**
```shell
rm /etc/nginx/sites-enabled/default
```

### SSL certificate installation

Now that we have a working Reverse Proxy on our monitoring server, we are going to add SSL layer to encrypt properly access to your Cardano Stakepool Grafana dashboard. To do this, we are going to use a free SSL certificate provider, Let’s Encrypt, with Certbot.

**Use snap to install certbot**
```shell
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
```

**Make a sym link so you can use certbot command anywhere**
```shell
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

**Start the installation and follow the instructions**
```shell
sudo certbot --nginx
```
Respond to prompts to configure your HTTPS settings (FQDN,email..).
At the end of installation, you should be able to access your Grafana Server with HTTPS :

https://your-FQDN

### Post install nginx hardening

**Block any unwanted HTTP method, except PUT POST GET and HEAD and configure websocket**
```shell
sudo nano /etc/nginx/sites-enabled/<your FQDN.conf>
```
Paste this line inside your "location /" block :
```shell
limit_except PUT GET HEAD POST { deny all; }
```
Paste this sub-block inside the first `server {` block
```shell
# Proxy Grafana Live WebSocket connections.
  location /api/live/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $http_host;
    proxy_pass http://grafana;
  }
```
Save and close.

**Nginx configuration file hardening**
```shell
sudo nano /etc/nginx/nginx.conf
```
Remove old cipher suites TLSv1.0 and TLSv1.1 : the SSL Settings should look like this :
```shell
##
# SSL Settings
##

ssl_protocols TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
ssl_prefer_server_ciphers on;
```

Prevent DoS and Buffer Oversized attacks : add this lines inside "http" block :
```shell
## Start: Size Limits & Buffer Overflows ##
 client_body_buffer_size  3K;
 client_header_buffer_size 3k;
 client_max_body_size 80k;
 large_client_header_buffers 2 10k;
 ## END: Size Limits & Buffer Overflows ##

### Directive describes the zone, in which the session states are stored i.e. store in slimits. ###
### 1m can handle 32000 sessions with 32 bytes/session, set to 5m x 32000 session ###
  limit_conn_zone $binary_remote_addr zone=addr:5m;

### Control maximum number of simultaneous connections for one session i.e. ###
### restricts the amount of connections from a single ip address ###
   limit_conn addr 10;
```
Save and close.

**Restart Nginx server**
```shell
sudo systemctl restart nginx
```

## Google OAuth setup

We are going to replace the local login/password access to Grafana server, by a much more robust authentication : Google OAuth. Remember : you must have your mail address on your own domain (see Pre-Requisites), and create a Google account with that address.

### Activate 2FA on your Google Account

Connect to the Google account you created with your own mail address, and activate 2FA Authentication :

1- In the navigation panel, select Security.

2- Under “Signing in to Google,” select 2-Step Verification. Get started.

3- Follow the on-screen steps.

### Create Google API credentials

1- Go to  https://console.developers.google.com/apis/credentials and log in with the Google account you created with your own mail address.

2- Click on "Create Credentials" on top of the page, and then click OAuth Client ID . (You may have to setup a “Consent page” first. Use defaults, it’s not very 
important in our case).

3- Enter these settings :

- Application Type: Web Application
- Name: Grafana
- Authorized JavaScript Origins: https://your-FQDN-used-to-access-your-grafana-server
- Authorized Redirect URLs: https://your-FQDN-used-to-access-your-grafana-server/login/google

4- Click on Create

5- You’ll get a Client ID and Client Secret. Copy them.

### Edit Grafana config file

**Open grafana.ini**
```shell
sudo nano /etc/grafana/grafana.ini
```

**In the Server section, find this setting and modify it**
```shell
root_url = https://your-FQDN-used-to-access-your-grafana-server/
```

**Next, go to the Google Auth section and modify these settings**
```shell
[auth.google] enabled = true
client_id = <copy your Google API client id>
client_secret = <copy your Google API clien secret>
scopes = https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email
auth_url = https://accounts.google.com/o/oauth2/auth
token_url = https://accounts.google.com/o/oauth2/token
allowed_domains = <your domain, like "yourdomain.com">
allow_sign_up =false 
```

Save and close the file

**Restart grafana server**
```shell
sudo systemctl restart grafana-server.service
```

Access to your Grafana FQDN : https://your-FQDN-used-to-access-your-grafana-server

You should now have a “Sign-in with Google” option on the login page. You can now use the account you created with your own domain name to access your Grafana Cardano dashboards. 

### Optional: Admin configuration

**Give the Google Account the administrator role, and then remove the local Admin/Password account**

1- Access your Grafana UI with your local Admin account

2- Go to "Users", and make your Google Account "Admin" by changing its role

3- Log in with your Google Account, go to "Users", and remove the local Admin account.

**Disable login form to allow only Google OAuth**

```shell
sudo nano /etc/grafana/grafana.ini
```
In the [auth] section  :
```shell
disable_login_form = true
```
Save and close the file
