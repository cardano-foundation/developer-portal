---
id: hardening-server
title: Hardening the server
sidebar_label: Hardening the server
description: Secure a Cardano stake pool server — SSH, nftables, WireGuard, fail2ban, and systemd hardening.
image: ../img/og/og-developer-portal.png
---

This guide covers the baseline security hardening for a Cardano stake pool server running Ubuntu 22.04 LTS. Apply it to each machine in your setup: relays, block producer, and monitoring host.

## 1. Non-root user

Never operate as root. Create a dedicated operator account with sudo access:

```bash
sudo useradd -m -s /bin/bash cardano-op
sudo passwd cardano-op
sudo usermod -aG sudo cardano-op
```

Log out and reconnect as `cardano-op` for all subsequent steps. Lock the root account:

```bash
sudo passwd -l root
```

## 2. SSH key authentication

On your **local machine**, generate an ED25519 key pair:

```bash
ssh-keygen -t ed25519 -C "stake-pool-ops"
```

Copy the public key to the server:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub cardano-op@<server-ip>
```

Verify you can log in with the key before continuing. Then harden `/etc/ssh/sshd_config` on the server:

```
Port 2222                          # change to any unprivileged port
PubkeyAuthentication yes
PasswordAuthentication no
PermitRootLogin without-password
PermitEmptyPasswords no
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
Compression no
TCPKeepAlive no
KbdInteractiveAuthentication no
MaxAuthTries 3
LoginGraceTime 30
```

Validate and reload:

```bash
sudo sshd -t && sudo systemctl reload ssh
```

:::caution
Back up your private key before disabling password authentication. If you lose the key you will be locked out.
:::

## 3. System updates

```bash
sudo apt-get update -y && sudo apt-get upgrade -y && sudo apt-get autoremove -y
sudo reboot
```

Enable automatic security updates (security patches only — will not reboot):

```bash
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 4. Firewall — nftables

Ubuntu ships with nftables. Create `/etc/nftables.conf` appropriate for your node role.

:::note
Replace `2222` with your actual SSH port, and adjust Cardano ports and IP ranges to match your setup.
:::

<details>
<summary><strong>Relay node</strong></summary>

```
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        # established / related
        ct state established,related accept

        # loopback
        iifname "lo" accept

        # ICMP (needed for path MTU discovery)
        ip protocol icmp accept
        ip6 nexthdr icmpv6 accept

        # SSH — restrict to your management IP if possible
        tcp dport 2222 accept

        # Cardano P2P — accept from any peer
        tcp dport 3001 accept
    }

    chain forward {
        type filter hook forward priority 0; policy drop;
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}
```

</details>

<details>
<summary><strong>Block producer — same-datacenter relays (no WireGuard)</strong></summary>

```
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        ct state established,related accept
        iifname "lo" accept
        ip protocol icmp accept
        ip6 nexthdr icmpv6 accept

        # SSH — management IP only
        ip saddr <your-management-ip> tcp dport 2222 accept

        # Cardano — relays only
        ip saddr { <relay-1-ip>, <relay-2-ip> } tcp dport 6000 accept
    }

    chain forward {
        type filter hook forward priority 0; policy drop;
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}
```

</details>

<details>
<summary><strong>Block producer — relays in a different datacenter (WireGuard)</strong></summary>

See [section 5 — WireGuard](#5-wireguard--relay--bp-across-datacenters) for the WireGuard setup first, then use this ruleset which accepts Cardano traffic only from the WireGuard interface:

```
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        ct state established,related accept
        iifname "lo" accept
        ip protocol icmp accept
        ip6 nexthdr icmpv6 accept

        # SSH — management IP only
        ip saddr <your-management-ip> tcp dport 2222 accept

        # WireGuard tunnel — accept the UDP handshake port
        udp dport 51820 accept

        # Cardano — only from WireGuard addresses
        iifname "wg0" ip saddr { 10.0.0.2, 10.0.0.3 } tcp dport 6000 accept
    }

    chain forward {
        type filter hook forward priority 0; policy drop;
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}
```

</details>

Enable and apply:

```bash
sudo systemctl enable nftables
sudo nft -f /etc/nftables.conf
sudo nft list ruleset   # verify
```

## 5. WireGuard — relay ↔ BP across datacenters

If your relays and block producer are in different datacenters, **do not expose the block producer's Cardano port to the public internet**. Run a WireGuard VPN between them and route Cardano traffic through the tunnel.

Install on each machine:

```bash
sudo apt-get install -y wireguard
```

Generate a key pair on each machine:

```bash
wg genkey | sudo tee /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key
sudo chmod 600 /etc/wireguard/private.key
```

**Block producer** — `/etc/wireguard/wg0.conf`:

```ini
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
PrivateKey = <bp-private-key>

[Peer]
# relay-1
PublicKey = <relay-1-public-key>
AllowedIPs = 10.0.0.2/32
PersistentKeepalive = 25

[Peer]
# relay-2
PublicKey = <relay-2-public-key>
AllowedIPs = 10.0.0.3/32
PersistentKeepalive = 25
```

**Relay 1** — `/etc/wireguard/wg0.conf`:

```ini
[Interface]
Address = 10.0.0.2/24
PrivateKey = <relay-1-private-key>

[Peer]
PublicKey = <bp-public-key>
Endpoint = <bp-public-ip>:51820
AllowedIPs = 10.0.0.1/32
PersistentKeepalive = 25
```

Enable on each machine:

```bash
sudo systemctl enable --now wg-quick@wg0
```

Verify the tunnel is up:

```bash
sudo wg show
ping 10.0.0.1   # from relay, should reach BP
```

Update your block producer's Cardano topology to use the WireGuard addresses (`10.0.0.2`, `10.0.0.3`) instead of public IPs. The nftables ruleset in section 4 already restricts Cardano traffic to the `wg0` interface.

## 6. fail2ban

fail2ban detects repeated login failures and bans the source IP.

```bash
sudo apt-get install -y fail2ban
sudo systemctl enable --now fail2ban
```

Create `/etc/fail2ban/jail.local`:

```ini
[DEFAULT]
bantime  = 1h
bantime.increment = true
bantime.factor = 2
bantime.maxtime = 5w
findtime = 10m
maxretry = 3

[sshd]
enabled  = true
port     = 2222
mode     = aggressive
maxretry = 3
```

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd   # verify
```

## 7. sysctl hardening

These settings harden the kernel's network stack for a server role. Edit `/etc/sysctl.d/99-cardano.conf`:

```ini
# SYN flood protection
net.ipv4.tcp_syncookies = 1

# Ignore ICMP broadcast requests (smurf protection)
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP error responses
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Reject source-routed packets
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Reject ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0

# Reverse path filtering — drop packets that appear to come from an unexpected interface
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Restrict dmesg to root
kernel.dmesg_restrict = 1
```

Apply:

```bash
sudo sysctl -p /etc/sysctl.d/99-cardano.conf
```

## 8. systemd unit hardening

The systemd service files in [Running cardano-node](/docs/get-started/infrastructure/node/running-cardano) already run the node as a dedicated `cardano` user with a `RuntimeDirectory`. Add these directives to the `[Service]` section for defense-in-depth:

```ini
NoNewPrivileges=yes
PrivateTmp=yes
ProtectHome=yes
ProtectSystem=strict
ReadWritePaths=/var/lib/cardano /run/cardano
PrivateDevices=yes
```

Reload after editing:

```bash
sudo systemctl daemon-reload && sudo systemctl restart cardano-node
```

## Verification checklist

```bash
# SSH key auth works, password auth rejected
ssh -o PasswordAuthentication=yes cardano-op@<server-ip>   # should fail

# nftables active
sudo nft list ruleset

# WireGuard up (if applicable)
sudo wg show

# fail2ban watching SSH
sudo fail2ban-client status sshd

# sysctl applied
sysctl net.ipv4.tcp_syncookies net.ipv4.conf.all.rp_filter
```
