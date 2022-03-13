---
id: grafana-dashboard-tutorial
title: Grafana Dashboard Tutorial
sidebar_label: Grafana Dashboard Tutorial
description: "Stake pool course: Grafana Dashboard Tutorial"
image: ../img/og-developer-portal.png
---

Once the Cardano pool sucessfully set-up, then comes the most beautifull part - setting up your Dashboard and Alerts! 


This documentation brings some of the available information in greater detail and will hopefully help Stake Pool Operators in managing their pools more efficiently. This tutorial is for education and learning purpose only!



**Prerequisites:**

- Ubuntu Server 20.04 LTS

- Cardano Block Producer Node up and running

- Cardano Relay Nodes up and running



## 1. Install prometheus node exporter on Block Producing Node



```shell
$ sudo apt-get install -y prometheus-node-exporter

$ sudo systemctl enable prometheus-node-exporter.service
```

:::note
for Ubuntu 18.04 refer the following tutorial [Ubuntu 18.04 Tutorial](https://sanskys.de/dashboard/)
:::


Update mainnet-config.json config files with new hasEKG and has Prometheus ports.
```shell
$ cd $NODE_HOME
$ sed -i mainnet-config.json -e "s/127.0.0.1/0.0.0.0/g"

On Producer Node open ports 12798 and 9100

$ sudo ufw allow proto tcp from <Relay Node IP address> to any port 9100

$ sudo ufw allow proto tcp from <Relay Node IP address> to any port 12798

$ sudo ufw reload
```

restart the node
```shell
$ sudo systemctl restart <your BP node name e.g. cnode>
```


## 2. Install Prometheus and prometheus node exporter on Relay Node



Install Prometheus

```shell
$ sudo apt-get install -y prometheus
```


Install prometheus node exporter on Relay Node

```shell
$ sudo apt-get install -y prometheus-node-exporter
```

repeat Step 2 for all your Relay Node



## 3. Install Grafana on Relay Node


```shell
$ wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

$ echo "deb https://packages.grafana.com/oss/deb stable main" > grafana.list
$ sudo mv grafana.list /etc/apt/sources.list.d/grafana.list

$ sudo apt-get update && sudo apt-get install -y grafana
```
Enable services so they start automatically
```shell
$ sudo systemctl enable grafana-server.service
$ sudo systemctl enable prometheus.service
$ sudo systemctl enable prometheus-node-exporter.service
```
Update prometheus.yml located in /etc/prometheus/prometheus.yml

Change the *ip address* in the following command
```shell
$ cat > prometheus.yml << EOF
global:
  scrape_interval:     15s # By default, scrape targets every 15 seconds.

  # Attach these labels to any time series or alerts when communicating with
  # external systems (federation, remote storage, Alertmanager).
  external_labels:
    monitor: 'codelab-monitor'

# A scrape configuration containing exactly one endpoint to scrape:
# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label job=<job_name> to any timeseries scraped from this config.
  - job_name: 'prometheus'

    static_configs:
      - targets: ['localhost:9100']

        labels:
          alias: 'relaynode1'
          type:  'cardano-node'

      - targets: ['<relay node 2 public ip address>:9100']

        labels:
          alias: 'relaynode2'
          type:  'cardano-node'
      - targets: ['<block producer public ip address>:9100']

        labels:
          alias: 'block-producer-node'
          type:  'cardano-node'
     - targets: ['localhost:12798']
        labels:
          alias: 'relaynode1'
          type:  'cardano-node'

     - targets: ['<relay node 2 public ip address>:12798']

        labels:
          alias: 'relaynode2'
          type:  'cardano-node'

     - targets: ['<block producer public ip address>:12798']
        labels:
          alias: 'block-producer-node'
          type:  'cardano-node'

EOF
```
if you have more than two Relay Nodes, add all your Relays as new "targets" in the config above
```shell
$ sudo mv prometheus.yml /etc/prometheus/prometheus.yml
```
restart the services
```shell
$ sudo systemctl restart grafana-server.service
$ sudo systemctl restart prometheus.service
$ sudo systemctl restart prometheus-node-exporter.service
```
Verify that the services are running properly
```shell
$ sudo systemctl status grafana-server.service prometheus.service prometheus-node-exporter.service
```
On Relay Node open ports 3000 for Grafana
```shell
$ sudo ufw allow from <your local IP address> to any port 3000
```
:::note
Please refer to [Grafana Labs Secuirty](https://grafana.com/docs/grafana/latest/administration/security/) for hardening e.g. by default the communication with the Grafana server is unencrypted.
:::

## 4. Setting up Grafana Dashboard



On Relay Node, open http://localhost:3000 or http://*your Relay Node ip address*:3000 in your local browser.
Login with admin / admin
Change password



Click the configuration gear icon, then Add data Source
Select Prometheus
Set Name to "Prometheus"
Set URL to http://localhost:9090
Click Save & Test



Download my Dashboard that you see on the top of this page, from the following GitHub link and save the JSON file


[SNSKY Dashboard Example](https://raw.githubusercontent.com/sandy4de/SNSKY/main/SNSKY_Dashboard_v2.json)



in Grafana, Click Create + icon (in left Menu) > Import
Add dashboard by Upload JSON file
Click the Import button.



If you nodes are in several time zones, it is usefull to add the Grafan Clock panel
```shell
$ grafana-cli plugins install grafana-clock-panel
```


Installed panels are available immediately in the Dashboards section in your Grafana main menu.

To see a list of installed panels, click the Plugins item in the main menu. Both core panels and installed panels will appear.



## 5. Add Data from Adapools to the Dashboard



Copy your JSON link or your Pool ID from Share/Promote Tab and JSON data outputs in adapools.org



Prometheus can work only with numeric data, so we must first trim non numeric strings which is returned from the JSON file. Lets create a shell script getstat.sh for the same

```shell
cd /$NODE_HOME

mkdir -p poolStat

cd poolStat

echo "curl https://js.adapools.org/pools/< YOUR POOL ID >/summary.json 2>/dev/null \

| jq '.data | del(.pool_id_bech32, .hist_bpe, .handles, .hist_roa, .db_ticker, .db_name, .db_url, .ticker_orig, .group_basic, .pool_id, .direct, .db_description, .tax_ratio_old, .tax_fix_old)' \

| tr -d \\\"{},: \

| awk NF \

| sed -e 's/^[ \t]*/adapools_/' > poolStat.prom" > getstats.sh

chmod +x getstats.sh

./getstats.sh

```
check the content of adapools.prom and it should not contain only numeric values
```shell
$ nano poolStat.prom
```


Configure promethues-node-exporter.service to grab data from poolStat.prom file
```shell
$ sudo cp /lib/systemd/system/prometheus-node-exporter.service /lib/systemd/system/prometheus-node-exporter.service_backup

$ sudo nano /lib/systemd/system/prometheus-node-exporter.service
```
Change ExecStart line to
```shell
ExecStart=/usr/bin/prometheus-node-exporter --collector.textfile.directory=< YOUR NODE FULL PATH >/poolStat --collector.textfile
```

Reload daemon and restart services
```shell
$ sudo systemctl daemon-reload

$ sudo systemctl restart prometheus-node-exporter.service

$ sudo systemctl restart prometheus.service
```


Now you should see in the Dashboard all Adapool statistics



Since the statistics will change, lets set cron job to update data from ADApools everyday


```shell
$ crontab -e
```

```shell
##############################

#Get data from ADApools every day at 06:00

0 6 * * * <YOUR NODE FULL PATH >/poolStat/getstats.sh

##############################
```


Done!



## 6. As last step let's now setup Grafana Alerting and Email Notifications



Setup SMTP in Grafana
```shell
$ sudo nano /etc/grafana/grafana.ini
```


Edit the SMTP section
```shell
#############################

[smtp]
enabled = true
host = smtp.<email server>:465
user = <email user name>
# If the password contains # or ; you have to wrap it with triple quotes. Ex """#password;"""
password = <email password>
from_address = sam@sanskys.de
from_name = Grafana

#############################
```


Login to Grafana with username and password.

Click on the "Bell" icon on the left sidebar.

Select "Notification channels."



Click on "Add Channel." This will open a form for adding new notification channel.

Give a name to this channel. I am using "Alert"



Select Email from "Type" as we want to send notifications over email.

Check the "Send on all alerts" in case you want email on all alerts.

Select the checkbox of "Include image" in case you want to include the image of the panel as the body in the notification email.

Add the target email in "Email addresses" text area. You can use multiple email address separated by ";"



Click on "Send Test" if you want to verify your settings. This will send a sample email using the SMTP details we configured earlier.

Click on "Save" to add this channel



Create an Alert if Producer Node is not reachable



Please not that Alerts can only be created for "Graph" panels!

Now we create an Alert to get an emaial if the Producer Node is not reachable



In the "Connected Peers" panel go to Alerts

Define the Rule "Connected Peer Alert" Evaluate every "1m" For "2m"



Condition
```shell
WHEN "last()" OF "query(A, 1m, now)" "HAS NO VALUE"
```


No Data & Error Handling

If no data or all values are null SET STATE TO "No Data"

If execution error or timeout SET STATE TO "Alerting"



Notifications

Send To - Choose your notofication channel, which in my case is "Alert"

Message - type in your alert message that should appear in the email



Press on "test Rule" to ensure that the Alert is correct and has no issues.

Now you are done! Stop you Producer Node and you should get an Alert within 4min.

:::note

If everything works, now you should have a smile on your face! And if you wish to support the Tutorial work, you could donate or delegate to my pool - SNSKY

Donation Address
**addr1qyyhd8cpv4gmhr5axerhezhtzldrw4rp9ayf0fc6arnme4cg46du2qg366943uy0dw5yjmna7arfw265lu4r2fjccl4scf7xrw**
SNSKY Pool ID
**075578defd7ee97cbeaa2937e5819099cb3835ac9f9c8b1a2c3a3578**

:::


## Recommended: Disabling Grafana Registrations and Anonymous Access



We should make Grafana a bit more secure and to do so lets change two settings
```shell
$ sudo nano /etc/grafana/grafana.ini
```


Locate the following allow_sign_up directive under the [users] heading and change the line to as follows
```shell
##########

[users] # disable user signup / registration

allow_sign_up = false

##########
```


Next, locate the following enabled directive under the [auth.anonymous] heading and change the line to as follows

```shell
[auth.anonymous]

enabled = false
```


Save the file and exit your text editor and to activate the changes, restart Grafana.


```shell
$ sudo systemctl restart grafana-server
```



:::note
A panel on Leader Slots has been included, which can Alert in case the pool is selected as a leader for the next Epoch. It is a bit more complicated, so will leave it out of the tutorial, but in principle there is script running on the Producer Node which updates the leader query result in a prom file which is parsed by the node exporter, exposing this metrics to the Relay Node. For details, just drop a message on Telegram.
:::
