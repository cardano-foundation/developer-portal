---
id: hardening-server
title: Hardening the server
sidebar_label: Hardening the server
description: "Stake pool guide: Learn how to harden your server"
image: ../img/og/og-developer-portal.png
---

Before installing your Cardano node, you need to have a clean and secured OS. This guide explains how to secure your server, in 10 steps.

### Prerequisites 

- This guide is designed for Ubuntu Server (22.04 LTS or 20.04 LTS)
- A SSH client on your local machine. If you are using a Windows machine, install OpenSSH Client ([guide](https://www.howtogeek.com/311287/how-to-connect-to-an-ssh-server-from-windows-macos-or-linux/))
- SSH server up and running on your Ubuntu Server

### 1- Create a non-root user for your Cardano node

First thing first : you should never use the root account to connect to your server and manage it. Instead, use a non-root account, that can use sudo. We are going to create one.

- Connect to your server with SSH (for this time only, you might use root. We'll disable it after anyway. You can also use the default user created by the Ubuntu installer).

```shell
ssh <defaultuser>@server-ip
```

- New user creation called cardano (or whatever you want)

```shell
sudo useradd -m -s /bin/bash cardano
```

- Set a strong password
```shell
sudo passwd cardano
```

- Allow cardano user to use sudo command
```shell
sudo usermod -aG sudo cardano
```

- Disconnect from your server, and reconnect using your new user
```shell
ssh cardano@server-ip
```

- Remove default user if needed
```shell
sudo userdel <defaultuser>
```

### 2- Disable root

You should never use root account. Always use sudo to run commands with privileges. We are going to disable it.

```shell
sudo passwd -l root
```

### 3- Update System

It's time to update your system with the latest pathes available.

```shell
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get autoremove
sudo apt-get autoclean
```

Reboot your server.
```shell
sudo reboot
```

### 4- Activate Unattended-upgrades for automatic security updates

Next step is to enable unattended upgrades to automatically install security updates.

:::important

By default, the unattended-upgrades service **only installs security updates** automatically. These updates **WONT** make your server automatically reboot.

The primary argument against enabling unattended-upgrades is that one day, a less stable package may install and cause stability or dependencies issues. While this argument is technically valid, the fact remains that without this package installed and enabled, it's more likely that a Linux server might host a software with remotely exploitable security vulnerabilities.

:::

```shell
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 5- Generate SSH keys

The next step might be one of the most important things to do, to secure your server. Passwords are not safe to use. Instead, use SSH keys. We are going to create a new SSH key pair on your local machine. I strongly recommend using ED25519 algorithm.

#### On your local machine

- Generate a a new key-pair. You will be asked to enter a filename to save your key
```shell
ssh-keygen -t ed25519
```

- Copy the public key to your server
```shell
ssh-copy-id -i $HOME/.ssh/<filename> cardano@server-ip
```

- Now disconnect from your server, and try to login again from your local machine where your private key is. This time you won't need to enter your password.
```shell
ssh cardano@server-ip
```

:::caution

Your private SSH key is what allow you to connect to your server. It is stored on your local machine. You should backup it to a secured cold storage, and never ever share it

:::


### 6- Hardening SSH configuration
The next-step is to tweak the sshd_config on your server, to make it much more secured

- Open the /etc/ssh/sshd_config file
```shell
sudo nano /etc/ssh/sshd_config
```

- Then locate and update if needed, all the options below

```shell
PubkeyAuthentication yes
PasswordAuthentication no
PermitRootLogin prohibit-password
PermitEmptyPasswords no
X11Forwarding no
TCPKeepAlive no
Compression no
AllowAgentForwarding no
AllowTcpForwarding no
KbdInteractiveAuthentication no
```

- Change the default sshd listening port as well with your own custom port (choose between 1024 - 49150)
```shell
Port <custom port number>
```

- Save and close your /etc/ssh/sshd_config. Validate the configuration
```shell
sudo sshd -t
```

- Then restart sshd
```shell
sudo systemctl restart sshd
```

- Disconnect from your server, and reconnect
```shell
ssh cardano@server-ip -p <custom port number>
```

### 7- Firewall configuration
We are going to use UFW firewall to secure network access to your Cardano node. We are only focusing on ports that are used for SSH, and Cardano node. If you want to use Grafana and Prometheus for monitoring, please, refer to this [guide](docs/operate-a-stake-pool/grafana-dashboard-tutorial.md), to add appropriate ports to your UFW configuration.

#### On your Relay Node :
```shell
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow to any proto tcp port <CUSTOM SSHD PORT>
sudo ufw allow to any proto tcp port <YOUR CARDANO NODE PORT>
sudo ufw enable
```

#### On your Block Producer Node :
```shell
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow to any proto tcp port <custom sshd port>
sudo ufw allow from <RELAY 1 NODE IP> to any proto tcp port <YOUR CARDANO NODE PORT>
sudo ufw allow from <RELAY 2 NODE IP> to any proto tcp port <YOUR CARDANO NODE PORT>
sudo ufw enable
```

If you want to permit SSH connections to your node from specific IP, replace : 
```shell
sudo ufw allow to any proto tcp port <CUSTOM SSHD PORT>
```
by 
```shell
sudo ufw allow from <SPECIFIC IP> to any proto tcp port <CUSTOM SSHD PORT>
```

### 8- Fail 2 ban installation and configuration

Fail2ban is a very useful tool to block repetitive intrusion attempts. It can detect failed logins from specific IP and patterns, and blacklist it.

Installation and service activation :

```shell
sudo apt-get install fail2ban -y 
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

Create a jail.local file and open it
```shell
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local
```

Locate the [DEFAULT] block and adjust to your needs. 
Here is a configuration example that allows 2 logins attempts within 10minutes, and ban for 1hour any IP that fails. After 1h, if the IP tries again and fails, the bantime will be incremented by factor *2. The maximum bantime is set to 5 weeks.

```shell
bantime  = 1h
bantime.increment = true
bantime.factor = 2
bantime.maxtime = 5w
findtime  = 10m
maxretry = 2
```

Locate the [sshd] block and adjust to your needs.

```shell
mode   = aggressive
enabled = true
port    = <YOUR SSHD CUSTOM PORT>
filter = sshd
maxretry = 2
logpath = /var/log/auth.log
backend = %(sshd_backend)s
```

Save and close. Open the sshd.conf filter file
```shell
sudo nano /etc/fail2ban/filter.d/sshd.conf
```

Locate the mode variable and set it to "aggressive"
```shell
mode = aggressive
```
Save and close.

Restart fail2ban
```shell
sudo systemctl restart fail2ban
```

:::important

Once again, please adjust fail2ban configuration above to your needs. You might want to allow more than 2 failed attempts, or decrease bantime

:::


### 9- /etc/sysctl.conf hardening

sysctl allows you to make changes to your linux kernel, and set advanced security options of the TCP/IP stack, and system settings. Here is a configuration recommendation to prevent some attacks on IPv4 networking layer.

Open /etc/sysctl.conf file

```shell
sudo nano /etc/sysctl.conf
```

Add these options at the end of the file

```shell
# Avoid a smurf attack
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Turn on protection for bad icmp error messages
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Turn on syncookies for SYN flood attack protection
net.ipv4.tcp_syncookies = 1

# Turn on and log spoofed, source routed, and redirect packets
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# No source routed packets here
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Increase TCP max buffer size setable using setsockopt()
net.ipv4.tcp_rmem = 4096 87380 8388608
net.ipv4.tcp_wmem = 4096 87380 8388608

# No redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0

## Disable packet forwarding
net.ipv4.ip_forward = 0

# Synflood protection
net.ipv4.tcp_synack_retries = 5
```

Save and close. Reload sysctl

```shell
sudo sysctl -p
```

### 10- Shared Memory hardening
Shared memory can be used in an attack against a running service. To secure it, modify /etc/fstab

```shell
sudo nano /etc/fstab
```
Add the following line at the end of the file

```shell
tmpfs	/run/shm	tmpfs	ro,noexec,nosuid	0 0
```
Save and close. Reboot your server

```shell
sudo reboot
```
