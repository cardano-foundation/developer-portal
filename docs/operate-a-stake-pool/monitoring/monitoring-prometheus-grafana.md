---
id: monitoring-prometheus-grafana
title: Monitoring with Prometheus and Grafana
sidebar_label: Prometheus & Grafana monitoring
description: Set up cardano-tracer, Prometheus, and Grafana to monitor Cardano nodes with the new tracing system.
keywords: [monitoring, Grafana, Prometheus, cardano-tracer, tracing, metrics, SPO, stake pool]
---

This guide sets up end-to-end monitoring for a Cardano stake pool using the new tracing system (Node 10.2+): nodes forward metrics to `cardano-tracer`, which exposes a Prometheus endpoint, which Grafana visualizes.

:::note
This guide covers **Node 10.2 and later**, which uses the new tracing system by default. The legacy tracing system (EKG/Prometheus directly from the node on port 12798) is no longer supported.
:::

## Architecture

```
  relay-1 ──┐
             │  (Unix socket over SSH tunnel)
  relay-2 ──┼──► cardano-tracer ──► Prometheus ──► Grafana
             │        │
  block-producer ─────┘        exposes /metrics
                                per node
```

`cardano-tracer` acts as an aggregator: one process collects traces and metrics from all your nodes, and exposes them via a single Prometheus HTTP endpoint. Prometheus scrapes that endpoint, and Grafana queries Prometheus.

## Prerequisites

- Cardano nodes running Node 10.2+ (new tracing system enabled by default)
- A monitoring machine (can be one of your relays, or a dedicated host)
- `cardano-tracer` binary — build it alongside `cardano-node`:

```shell
# Cabal
cabal build cardano-tracer && cabal install cardano-tracer --installdir=$HOME/.local/bin --overwrite-policy=always

# Nix
nix build github:IntersectMBO/cardano-node#cardano-tracer
cp result/bin/cardano-tracer $HOME/.local/bin/
```

## Step 1 — Configure each node

Edit your node's `config.json` to enable the `Forwarder` and `EKGBackend` backends, and set a node name:

```json
{
  "UseTraceDispatcher": true,
  "TraceOptionNodeName": "relay-1",
  "TraceOptions": {
    "": {
      "severity": "Notice",
      "detail": "DNormal",
      "backends": [
        "EKGBackend",
        "Forwarder"
      ]
    }
  }
}
```

Set `TraceOptionNodeName` to a unique, descriptive name for each node (`relay-1`, `relay-2`, `block-producer`, etc.). This becomes the path component in the Prometheus endpoint URL and the `node_name` label in Prometheus.

Then add the tracer socket flag to your node's startup command:

```shell
cardano-node run \
  ... \
  --tracer-socket-path-connect /run/cardano/tracer.sock
```

:::caution
Enable `Forwarder` only when `cardano-tracer` is running and reachable. If traces accumulate without being consumed, the node buffers them in RAM. The buffer is bounded, but sustained disconnection will increase memory usage.
:::

## Step 2 — Configure cardano-tracer

On your **monitoring machine**, create `/etc/cardano/tracer-config.json`:

```json
{
  "networkMagic": 764824073,
  "network": {
    "tag": "AcceptAt",
    "contents": "/run/cardano/tracer.sock"
  },
  "logging": [
    {
      "logRoot": "/var/log/cardano-tracer",
      "logMode": "FileMode",
      "logFormat": "ForMachine"
    }
  ],
  "rotation": {
    "rpFrequencySecs": 3600,
    "rpKeepFilesNum": 14,
    "rpLogLimitBytes": 104857600,
    "rpMaxAgeHours": 24
  },
  "hasPrometheus": {
    "epHost": "127.0.0.1",
    "epPort": 12789
  }
}
```

Replace `764824073` with your network's magic (mainnet shown). For other networks, find it in your `shelley-genesis.json`:

```shell
jq .networkMagic /path/to/shelley-genesis.json
```

Run `cardano-tracer`:

```shell
cardano-tracer --config /etc/cardano/tracer-config.json
```

Verify it is listening:

```shell
curl -s http://127.0.0.1:12789/
# Should list connected node names as hyperlinks
```

## Step 3 — Connect nodes to the tracer via SSH tunnels

For **same-machine** setups (tracer and node on the same host), no tunnel is needed — the socket path is shared directly.

For **remote nodes**, forward the tracer's socket over SSH from each node's machine. Run this on each node host, replacing the IP with your monitoring machine's address:

```shell
ssh -nNT \
  -L /run/cardano/tracer.sock:/run/cardano/tracer.sock \
  -o "ExitOnForwardFailure yes" \
  monitoring@<monitoring-machine-ip>
```

:::tip
Start the SSH tunnel **before** starting the node. The node connects to the socket at startup; if the socket does not exist yet, it will fail to connect to the tracer.
:::

Add the SSH tunnel as a systemd service or include it in your node startup script so it reconnects automatically on restart.

## Step 4 — Install prometheus-node-exporter on each node

`prometheus-node-exporter` provides host-level metrics (CPU, memory, disk, network) that complement the Cardano application metrics from `cardano-tracer`.

```shell
# Debian / Ubuntu
sudo apt-get install -y prometheus-node-exporter
sudo systemctl enable --now prometheus-node-exporter

# Allow Prometheus to scrape it (replace with your monitoring machine IP)
sudo ufw allow proto tcp from <monitoring-machine-ip> to any port 9100
```

## Step 5 — Install and configure Prometheus

On the **monitoring machine**:

```shell
sudo apt-get install -y prometheus
```

Replace the contents of `/etc/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  external_labels:
    environment: mainnet          # matches the $environment variable in the Grafana dashboard

scrape_configs:
  # Cardano application metrics — via cardano-tracer HTTP service discovery
  # Automatically discovers all connected nodes; no config change needed when adding nodes
  - job_name: cardano-node
    http_sd_configs:
      - url: http://127.0.0.1:12789/targets

  # Host metrics from each node machine
  - job_name: node-exporter
    static_configs:
      - targets:
          - relay-1:9100
          - relay-2:9100
          - block-producer:9100
```

The `environment` external label is picked up by the Grafana dashboard's `$environment` variable.

Restart Prometheus and verify it is scraping:

```shell
sudo systemctl restart prometheus
# Open http://localhost:9090/targets — all cardano-node targets should show "UP"
```

## Step 6 — Install Grafana

```shell
sudo apt-get install -y apt-transport-https software-properties-common
wget -q -O - https://apt.grafana.com/gpg.key | sudo apt-key add -
echo "deb https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt-get update && sudo apt-get install -y grafana

sudo systemctl enable --now grafana-server
```

Open `http://<monitoring-machine-ip>:3000` and log in (default: `admin` / `admin` — **change this immediately**).

Add Prometheus as a data source:

1. **Configuration → Data sources → Add data source → Prometheus**
2. Set URL to `http://localhost:9090`
3. Click **Save & test**

Note the data source name you chose (e.g. `Prometheus`). You will need it when importing the dashboard.

For hardening Grafana (HTTPS, disabling public registration), see [Improve Grafana Security](../../deployment-scenarios/improve-grafana-security).

## Step 7 — Import the dashboard

Download the dashboard JSON:

**[cardano-node-application-metrics.json](/grafana/cardano-node-application-metrics.json)**

In Grafana: **Dashboards → Import → Upload JSON file**, select the downloaded file, then click **Import**.

**Important — set the data source**: The dashboard panels reference a datasource named `mimir` (the name used in the IOG internal setup). Grafana will prompt you to map it during import — select your Prometheus datasource from the dropdown.

After import, use the **Environment** and **Instance** dropdowns at the top of the dashboard to select your network and nodes.

### Dashboard panels

| Row | What it shows |
|---|---|
| Blocks, Slots, Epochs, and Quality | Chain tip, slot height, density, forks, block replay, late blocks |
| Forging | Leader slots, blocks forged, KES periods remaining, missed slots |
| Mempool and Transactions | Mempool size, tx submission rates, rejection rate |
| CPU, Memory, Disk, Info | GC, memory residency, host CPU/memory, node build info |

## Troubleshooting

**Panels show "No data"**

- Confirm `cardano-tracer` is running: `curl http://127.0.0.1:12789/`
- Confirm your node is connected: the tracer index page should list your node name
- Confirm Prometheus is scraping: check `http://localhost:9090/targets`
- Check metric names — some names changed between the old and new tracing systems. See the [metrics migration guide](../../../get-started/infrastructure/node/new-tracing-system/metrics-migration) for the full rename table.

**Tracer shows no connected nodes**

- Check the socket path matches between node CLI (`--tracer-socket-path-connect`) and tracer config (`contents`)
- If using SSH tunnels, confirm the tunnel is up before the node starts
- Check firewall: the socket path must be accessible to both processes (same host or via tunnel)

**Node memory keeps growing**

- The `Forwarder` backend is enabled but `cardano-tracer` is not consuming traces
- Check the tracer is running and the socket connection is established

## Further reading

- [New Tracing System quick start](../../../get-started/infrastructure/node/new-tracing-system/new-tracing-system)
- [cardano-tracer reference](../../../get-started/infrastructure/node/new-tracing-system/cardano-tracer)
- [Metrics migration guide](../../../get-started/infrastructure/node/new-tracing-system/metrics-migration)
- [Improve Grafana Security](../../deployment-scenarios/improve-grafana-security)
