![ansible-cardano](https://user-images.githubusercontent.com/84546123/137635107-1b183f63-3cac-4ef9-be9e-3f116cb79aef.png)

# ansible-cardano-node
Ansible playbook for provisioning a Cardano stake pool 

## Overview

This repository contains an [Ansible](https://www.ansible.com/) playbook for provisioning secure, optimized Cardano nodes for Stake Pool Operators (SPOs). It was originally developed for the [MOAI Pool](https://moaipool.com/) (Ticker: **MOAI**) but is now being made available to the greater Cardano community.

If you find this useful for maintaining your own stake pool or for other applications, please consider staking to MOAI. It means a great deal to us!

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
 - [Final thoughts](#final-thoughts)

## Why Ansible?
Ansible is an automation tool for provisioning, application deployment and configuration management. Gone are the days of SSH'ing into our servers to run a command or hacking together bash scripts. 

Ansible is completely agent-less, meaning no special software is required on the remote hosts. All commands are run through Ansible via SSH.

Commands executed via Ansible are [_idempotent_](https://en.wikipedia.org/wiki/Idempotence), meaning they can be safely run multiple times without anything being changed, unless required. Need to ensure a `cardano-node` configuration is up-to-date on all hosts? Simply run the command and Ansible will ensure only those that need the update will receive it. All other hosts will remain untouched.

Ansible is an incredibly popular [open source project](https://github.com/ansible/ansible) with [hundreds of available modules](https://docs.ansible.com/ansible/2.8/modules/list_of_all_modules.html). For more answers to the 'why?' question, check out Red Hat's announcement of [Ansible's acquisition](https://www.redhat.com/en/blog/why-red-hat-acquired-ansible) and [this post](https://hvops.com/articles/ansible-vs-shell-scripts/) comparing Ansible with other popular configuration management tools. 

## Installation
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

## Playbooks
Playbooks are a way of chaining commands together, essentially creating a blueprint or set of procedual instructions. Ansible executes the playbook in sequence and verifies the result of each command before moving onto the next. If you cancel the playbook execution partway through and restart it later, only the commands that haven’t completed previously will execute—the rest will be skipped.

Some basic playbook terminology is given below.

**Roles** add organisation to playbooks. They split complex build instructions into smaller reusable chunks. This makes it possible to share roles across different playbooks without duplicating code. 

**Templates** are files containing some variables and expressions, which we can replace with the corresponding values using the  Ansible template module. This helps to make the file reusable since the same file can be used dynamically for configuring many servers. 

**Hosts and group variables** are part of Ansible's [inventory setup](https://docs.ansible.com/ansible/latest/intro_inventory.html) to manage individual hosts and logical groups of hosts (detailed below). This negates the need to remember individual IP addresses or domain names. It also provides a simple method of managing host-specific configurations.  

**Handlers** contain logic that should be performed after a module has finished executing. They work very similar to notifications or events. For example, when the `ufw	` configuration has changed the handler restarts the firewall service. It’s important to note that these events are only fired when the module state has changed.

## Organization
This is the basic directory structure used to organize the playbook:

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


## Inventory setup
Before doing anything else, we need to tell Ansible what will run where. Ansible works against multiple managed nodes or hosts in our infrastructure at the same time, using a list or group of lists known as _inventory_. Once our inventory is defined, we can use patterns to select the hosts or groups you want Ansible to run against. The simplest approach is to declare a single `hosts` file that contains all known hosts. This file can be in INI or YAML format. An example hosts INI file is shown below:

```
[node]
foo.mypool.com
bar.mypool.com
```

This inventory setup works well for simple configurations, but shows its limitations as the complexity of a configuration grows. For our purposes, a better approach is to break a single `hosts` delcaration into functional groups. There are no hard and fast rules about this organization pattern, which is one of Ansible's strong suits. However, this flexibility can also be somewhat daunting when designing an inventory from scratch. We can create groups that track:

- What - An application, stack or microservice (e.g., database servers, web servers, etc.)
- Where - A datacenter or geographic region, to talk to local DNS, storage, etc. (e.g., east, west, Newark, Paris, Cape Town)
- When - The development stage, to avoid testing on production resources. (e.g., production, staging, test)

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

> **Note**: for security reasons, you may wish to obfuscate, or hide, your block producer(s) public IP addresses. In this case, you may replace the FQDN in the example above with an IP address. The end results are the same.

## Group variables
Groups are nice for organization, but they are also used to handle variables. For example, the file `/groups_vars/all` has the following definitons:

```
---
# Cross-environent variables are stored here

# ports 
ssh_port: "22"
cardano_default_port: "6000"

```

This is a very minimal example. However, you can think about how `group_vars` can be used to store variables or other settings on a [functional or per-group basis](https://docs.ansible.com/ansible/latest/user_guide/playbooks_variables.html#defining-variables-in-inventory). 

> **Note:** Ansible provides a [vault](https://www.ansible.com/blog/2014/02/19/ansible-vault) facility to encrypt data such as passwords or keys, rather than as plaintext in playbooks.

## User setup
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
	
> **Note:** The above user setup could also be done via a playbook, as root. This is a good candidate for a future enhancement. 

## Using tags
Tag are attributes that can be defined in an Ansible structure and used to selectively execute a subset of tasks. Tags are extremely useful because they allow us to run only a specific part of a large playbook, rather than running _everything_ in it. Tags can be applied to many structures in Ansible, but their simplest use is with individual tasks. The example below shows two tasks within the `cardano-node` role that use different tags:

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

## Running a playbook
An example playbook execution is shown below. This playbook targets the `relay-node` inventory using vault credentials. The optional `--tags` specify tasks tagged as "configuration" settings. Finally the `--check` mode is a "dry run" option that does not make any changes on remote systems:

```
ansible-playbook provision.yml -i inventories/relay-node --vault-password-file ~/.vault_pass.txt --tags "install" --check
```
Assuming the host file is populated and the hosts are accessible, you should see some output like this:

![playbook](https://user-images.githubusercontent.com/229399/135495282-5aaa1f3d-77d3-472b-826e-079c81b1da82.png)

The process above includes downloading and compiling `cardano-node` from source, along with the latest dependencies, if needed.  

## Base configuration
A set of known-good base settings are provided in this playbook. Where applicable, under each role you will find a file called `/defaults/main.yml`. These files contain default values for variables and should be modified _prior to provisioning a live node_. For example, the `ssh` role applies several Linux security best practiecs to harden secure shell access to your nodes. The file `ssh/defaults/main.yml` should be modified to match your remote administration IP address (that is, the machine you execute Ansible from):

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

## Final thoughts
Use Ansible's `--check` option when executing a playbook for the first time. This will safely execute the playbook and check for  any errors _without_ modifying your hosts.

If you have manually configured your Cardano nodes in the past, it is strongly advised that you start with a fresh install of Ubuntu 20.04 LTS and execute your Ansible playbook against this new host.

Lastly, if you find this playbook and documention useful **please delegate to MOAI pool**. We appreciate it!
