---
id: ansible-cardano-node
title: Get Started with Ansible for Stake Pools
sidebar_label: Ansible for Stake Pools
description: Get Started with Ansible for Stake Pools
---

![ansible-cardano](https://user-images.githubusercontent.com/84546123/137635107-1b183f63-3cac-4ef9-be9e-3f116cb79aef.png)

## Overview

The [Ansible cardano-node](https://github.com/moaipool/ansible-cardano-node) repository contains an [Ansible](https://www.ansible.com/) playbook for provisioning secure, optimized Cardano nodes for Stake Pool Operators (SPOs). It was originally developed by the **[**MOAI Pool** operators but is now being made available to the greater Cardano community.

The following is handled out of the box:

* Basic Linux security (SSH hardening, firewall setup, etc.)
* Installation of a cardano-node (compiled from IOHK source)
* Base configuration for block producer and relay nodes
* Setup of administration & monitoring tools (cncli, gLiveView, etc.)

To facilitate the above the following minimal software packages are installed:

* git-core
* ufw
* unattended-upgrades
* logrotate
* logwatch
* net-tools
* tmuxinator
* vim
* htop
* curl

## Contents

 - [Why Ansible?](#why-ansible)
 - [Installation](#installation)
 - [Playbooks](#playbooks)
 - [Organization](#organization)
 - [Inventory setup](#inventory-setup)
 - [User setup](#user-setup)
 - [Using tags](#using-tags)
 - [Running a playbook](#running-a-playbook)
 - [Base configuration](#base-configuration)
 - [Optional components](#optional-components)
 - [Pro tips](#pro-tips)

### Why Ansible?
Ansible is a provisioning, application deployment, and configuration management automation tool. Gone are the days of putting together bash scripts or SSH'ing into our servers to conduct a task.

Ansible is agentless, which means it doesn't require any specific software on the remote systems. SSH is used to run all commands through Ansible.

Commands executed via Ansible are [_idempotent_](https://en.wikipedia.org/wiki/Idempotence), meaning they can be safely run multiple times without anything being changed, unless required. Need to ensure a `cardano-node` configuration is up-to-date on all hosts? Simply run the command and Ansible will ensure only those that need the update will receive it. All other hosts will remain untouched.

Ansible is an extremely popular [open source project](https://github.com/ansible/ansible) with [hundreds of available modules](https://docs.ansible.com/ansible/2.8/modules/list_of_all_modules.html).

### Installation
A single control machine can be setup to execute Ansible commands. The example below uses OS X, but any platform with Python installed will work (including [Windows](https://docs.ansible.com/ansible/latest/intro_windows.html)).

>**Note:** Ansible is written in Python, but it isn't necessary to code in Python. You never have to touch Python unless you want to. The Ansible scripts themselves are written in the very simple YAML format. 

First, verify that `pip` is installed:

```
sudo apt install python-pip
```
Then install Ansible and the [netaddr](https://pypi.org/project/netaddr/) Python package. The latter is used by the `ipaddr()` filter in our Jinja2 templates:

```
sudo pip install ansible
sudo pip install netaddr
```
Alternatively, if you have [Homebrew](https://brew.sh/) installed (surely you must) then you can install Ansible like so:

```
brew install ansible 
```

Once the installation has finished you can verify that everything installed correctly by issuing:

```
ansible --version
```

### Playbooks
Playbooks are a method of chaining commands to create a blueprint or collection of procedural instructions. Ansible runs the playbook in order, verifying each command's output before going on to the next. If you stop the playbook execution in the middle and continue it later, only the instructions that haven't finished yet will run; the remainder will be skipped.

Some basic playbook terminology is given below.

**Roles** help playbooks stay organized. They broke down complicated build instructions into manageable parts. This allows roles to be shared between playbooks without having to duplicate code.

**Templates** are files that contain variables and expressions that the Ansible template module can replace with the appropriate values. This makes the file more reusable because it can be used dynamically to configure several servers with the same file.

**Hosts and group variables** are part of Ansible's [inventory setup](https://docs.ansible.com/ansible/latest/intro_inventory.html) to manage individual hosts and logical groups of hosts (detailed below). This negates the need to remember individual IP addresses or domain names. It also provides a simple method of managing host-specific configurations.  

**Handlers** contain logic that should be performed after a module has finished executing. They work very similar to notifications or events. For example, when the `ufw` configuration has changed the handler restarts the firewall service. It’s important to note that these events are only fired when the module state has changed.

### Organization
The basic directory structure used to organize the playbook is shown below:

```
├── ansible-cardano-node/
│   ├── filter_plugins
│   ├── group_vars
│   └── inventories
│       ├── block-producer/
│       ├── relay-node/
│       ├── all.yml
│       ├── vault
│   ├── roles/
│   │   ├── cardano-node/
│   │   ├── common/
│   │   ├── ssh/
│   │   └── ufw/
│   ├── ansible.cfg
│   ├── apt_periodic
│   └── provision.yml
```
All the various Ansible tasks, handlers, configurations and so on are contained above. The specifics are described in the following sections.


### Inventory setup
We need to tell Ansible what will run where before we do anything else. Ansible uses a list or group of lists called _inventory_ to work against numerous managed nodes or hosts in our infrastructure at the same time. After we've built our inventory, we can utilize patterns to choose the hosts or groups that Ansible should execute against. The most straightforward solution is to create a single 'hosts' file that contains all known hosts. The format of this file can be INI or YAML. The following is an example of a hosts INI file:

```
[node]
foo.mypool.com
bar.mypool.com
```

This inventory arrangement works well for simple configurations, but as the complexity of a configuration rises, it reveals its limitations. A preferable technique for our needs is to divide a single `hosts` declaration into functional groups. This organization style has no hard and fast rules, which is one of Ansible's strong advantages. When creating an inventory from scratch, though, this versatility might be intimidating. We can make groups that keep track of:

- What - An application, stack or microservice (e.g., database servers, web servers, etc.)
- Where - A datacenter or geographic region, to talk to local DNS, storage, etc. (e.g., east, west, Newark, Paris, Cape Town)
- When - The development stage, to avoid testing on production resources (e.g., Mainnet, [testnets](docs/get-started/testnets-and-devnets.md))

For our purposes, we have chosen a combination of the "what" and "when" group structures. Let's look at a high-level overview of our inventory group structure:

```
├── ansible-cardano-node/
    └── inventories
        ├── block-producer/
        └── relay-node/
```

You can see that each of these groups correspond to a unique node type. Within `block-producer` we find an INI file like so:

```
[node]
blockprod.mypool.com ansible_user=deploy
```

Here the Ansible user `deploy` is used throughout, although a different user with specific rights/capabilities could be defined for each host. You can also see that the functional (or "what") groups are defined here with each of the fully-qualified domain names (FQDN) corresponding to a production backend host.

:::note 
For security reasons, you may wish to obfuscate, or hide, your block producer(s) public IP addresses. In this case, you may replace the FQDN in the example above with an IP address. The end results are the same.
::::

### Group variables
Groups are nice for organization, but they are also used to handle variables. For example, the file `/groups_vars/all` has the following definitions:

```
---
# Cross-environent variables are stored here

# ports 
ssh_port: "22"
cardano_default_port: "6000"

```

This is a very minimal example. However, you can think about how `group_vars` can be used to store variables or other settings on a [functional or per-group basis](https://docs.ansible.com/ansible/latest/user_guide/playbooks_variables.html#defining-variables-in-inventory). 

:::note 
Ansible provides a [vault](https://docs.ansible.com/ansible/latest/vault_guide/index.html) facility to encrypt data such as passwords or keys, rather than as plaintext in playbooks.
::::

### User setup
We enhance security and ease of use by requiring public key authentication for our user accounts. Thereafter Ansible only interacts via the **deploy** account.

1. Start by creating the **deploy** user:

	```
	useradd deploy
	mkdir /home/deploy
	mkdir /home/deploy/.ssh
	chmod 700 /home/deploy/.ssh
	chown -R deploy:deploy /home/deploy
	```
    
Set a strong password for the new user: `passwd deploy`. You'll use this once when adding your public key in the next step. Thereafter passwords won't be needed by Ansible.

2. Securely copy the public key from your workstation to the remote host (relay1.mypool.com, in this example):

	```
	ssh-copy-id -i ~/.ssh/id_rsa.pub deploy@relay1.mypool.com
	
	The authenticity of host 'relay1.mypool.com (<no hostip for proxy command>)' can't be established.
	ECDSA key fingerprint is SHA256:HRTSF5/nHmrgiNDvHFZ6OhxF9whXl4o7O1KwuW6Fbd0.
	Are you sure you want to continue connecting (yes/no)? yes
	/usr/local/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
	/usr/local/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
	deploy@relay1.mypool.com's password:
	
	Number of key(s) added: 1
	```

Now try logging into the machine with `ssh deploy@relay1.mypool.com` to verify that the key was added successfully.
	
3. Use visudo to grant sudo access to the deploy user and don't require a password each time:

```
visudo
```
Comment all existing user/group grant lines and add:
	
```
# User privilege specification
root    ALL=(ALL:ALL) ALL
deploy  ALL=(ALL) NOPASSWD:ALL
	
# Allow members of group sudo to execute any command
%sudo  ALL=(ALL:ALL) NOPASSWD:ALL

```

Login as the deploy user and verify that you have sudo access with the  -v (validate) option:
	
```
sudo -v
```
	
You will probably want to change the default shell to bash:
```
sudo chsh -s /bin/bash deploy
```

### Using tags
Tags are attributes defined in an Ansible structure that can be used to perform a subset of tasks selectively. Tags are highly valuable since they allow us to run only a portion of a huge playbook instead of the entire thing. In Ansible, tags can be used to a variety of structures, although their most basic application is with individual tasks. Two tasks inside the 'cardano-node' role that employ distinct tags are shown below:

```
- name: "Node Install | Building Cardano node"
  shell: cd /home/{{ server_username }}/cardano-node && cabal build cardano-node cardano-cli
  tags:
    - install
    - node

- name: "Node Install | Stop cardano-node service"
  systemd:
    name: cardano-node.service
    state: stopped
  tags:
    - binaries
    - install
    - node
```

When running a playbook, you can use `–tags` or `–skip-tags` to execute a subset of tasks. You can also see which tasks will be executed with these options by combining it with `--list-tasks`. For example:

```
ansible-playbook provision.yml --tags "install" --list-tasks
```

Advanced tag usage including inheritance and special tags are covered [here](https://docs.ansible.com/ansible/latest/user_guide/playbooks_tags.html). 

### Running a playbook
An example playbook execution is shown below. This playbook targets the `relay-node` inventory using vault credentials. The optional `--tags` specify tasks tagged as "configuration" settings. Finally the `--check` mode is a "dry run" option that does not make any changes on remote systems:

```
ansible-playbook provision.yml -i inventories/relay-node --vault-password-file ~/.vault_pass.txt --tags "install" --check
```
Assuming the host file is populated and the hosts are accessible, you should see some output like this:

![playbook](https://user-images.githubusercontent.com/229399/135495282-5aaa1f3d-77d3-472b-826e-079c81b1da82.png)

The process above includes downloading and compiling `cardano-node` from source, along with the latest dependencies, if needed.  

### Base configuration
A set of known-good base settings are provided in this playbook. Where applicable, under each role you will find a file called `/defaults/main.yml`. These files contain default values for variables and should be modified prior to provisioning a live host. For example, the `ssh` role applies several Linux security best practices to harden secure shell access to your nodes. The file `ssh/defaults/main.yml` should be modified to match your remote administration IP address (that is, the machine you execute Ansible from):

```
ssh_allowed_users: "AllowUsers deploy@127.0.0.1/32"
```

The `ufw` role configures the Linux firewall service and requires that the following default values be defined:

```
# Relay node public IP addresses
relay_node_ips:
  - 127.0.0.1/32  #relay1.mypool.com
  - 127.0.0.2/32  #relay2.mypool.com

# Trusted IP addresses, used for remote access/administration
trusted_ips:
  - 127.0.10.1/32
  - 127.0.10.2/32
```

The placeholder values for the relay nodes above must agree with your real relay host IP addresses, else they will not be able to communicate with the block producer or each other.

Likewise, the file `cardano-node/defaults/main.yml` contains values that will be used to populate your pool's metadata. These placeholder values should be replaced:

```
# Pool metadata
cardano_pool_name: "My Cardano Stake Pool"
cardano_pool_description: "A description of my stake pool"
cardano_pool_ticker: "My Pool ticker symbol"
cardano_pool_homepage: "https://mypool.com/"
cardano_pool_extended: "https://mypool.com/extendedMetaData.json"
```

Be sure to define your inventory before executing the playbook. The inventory file for your relay nodes must contain FQDNs for each of your relays. This file exists in `inventories/relay-node/inventory`:

```
[node]
relay1.mypool.com ansible_user=deploy
relay2.mypool.com ansible_user=deploy
```

Likewise, assign a public IP address for your block producer. This file exists in `inventories/block-producer/inventory`:

```
[node]
127.0.0.1 ansible_user=deploy
```

### Optional components

#### cardano-submit-api
The `cardano-submit-api` provides a web API that allows transactions (generated by an external wallet, for example) to be posted to the Cardano blockchain. To submit a transaction to the network (Mainnet, staging, or any of the testnets), `cardano-node` must be running and have access to the genesis file and genesis hash value for the network. Given that our playbook installs a full `cardano-node`, this requirement is already fulfilled. 

Stake pool operators may wish to install and enable the web API on one or more of their relays. This provides another mempool for users to submit their transactions to. This component is disabled by default. To enable it, set the following value in `/roles/cardano-node/defaults/main.yml` to `true`:

```
# Cardano submit API (optional)
cardano_submit_api: false
```

You may wish to install the `cardano-submit-api` as part of your default relay node setup, or selectively after your relays are up and running. In the latter case, you may install the web API by specifying the associated tag when executing the playbook, like so:

```
ansible-playbook provision.yml -i inventories/relay-node --vault-password-file ~/.vault_pass.txt --tags "api"
```

>**Note:** To prevent installation of `cardano-submit-api` on the block producer, these tasks will _only_ be executed if the `relay-node` inventory is specified during playbook execution. 

The associated tasks will handle the build process and installation of `cardano-submit-api` to `/usr/bin`. It will also check for and, optionally, download IOHK's [`mainnet` base configuration settings](https://raw.githubusercontent.com/input-output-hk/cardano-node/master/cardano-submit-api/config/tx-submit-mainnet-config.yaml).

Finally, two scripts are created: 1) `tx-api.sh` is added to `/opt/cardano/cnode/scripts` to handle startup of the API, and 2) `tx-api.service` is installed to `/etc/systemd/system` and enabled. The latter `systemd` service allows the API to started and its running status to be checked, like so:

```
sudo systemctl start tx-api.service
sudo systemctl status tx-api.service
```

With the API service active, your relay node(s) will have a tx submit api running on port 8090. To make this available outside of your local network, you will need to open the port. This may be done with `ufw` like so:

```
sudo ufw allow 8090/tcp
```

An example signed transaction is shown below:

```
$ curl --header "Content-Type: application/cbor" -X POST http://localhost:8090/api/submit/tx --data-binary @tx.signed.cbor
"8a3d63d4d95f669ef62570f2936ad50d2cfad399e04808ca21474e70b11987ee"%
```

### Pro tips
Use Ansible's `--check` option when executing a playbook for the first time. This will safely execute the playbook and check for  any errors _without_ modifying your hosts.

If you have manually configured your Cardano nodes in the past, it is strongly advised that you start with a fresh install of Ubuntu 20.04 LTS and execute your Ansible playbook against this new host.

