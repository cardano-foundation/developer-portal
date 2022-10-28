---
id: setup-virtual-box-written
title: Installing VirtualBox
sidebar_label: Installing VirtualBox
description: "Stake pool course: Learn how to install and setup VirtualBox."
image: ../img/og/og-developer-portal.png
---

In order to build a node from source, run it and connect it to the Cardano mainnet, you need a Linux system with at least 4GB RAM and 24GB hard drive space. The RAM is mostly needed for _building_ the node; for _running_ it, 1GB would be sufficient. The hard drive space is necessary if you want to connect to and download the Cardano blockchain.

You can use VirtualBox to learn how to set up stake pool.

## Install Virtual Box:

[https://www.virtualbox.org/wiki/Downloads](https://www.virtualbox.org/wiki/Downloads)

## Install Ubuntu 20.04

Follow this tutorial to setup a virtual machine with ubuntu 20.04 Desktop:

[https://linuxhint.com/install\_ubuntu\_virtualbox\_2004/](https://linuxhint.com/install_ubuntu_virtualbox_2004/)

When you have finished creating your virtual Machine, open a terminal and run to install Install VirtualBox Guest Additions on Ubuntu VirtualBox VM.

```sh
sudo apt install virtualbox-guest-dkms virtualbox-guest-x11 virtualbox-guest-utils
```

:::tip questions or suggestions?

If you have any questions and suggestions while taking the lessons please feel free to [ask in the Cardano forum](https://forum.cardano.org/c/staking-delegation/setup-a-stake-pool/158) and we will respond as soon as possible.

:::
