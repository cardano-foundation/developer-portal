---
id: frankenwallet
title: Get Started with the Frankenwallet
sidebar_label: Frankenwallet (USB air gap)
description: An encrypted, air-gapped Linux bootable USB drive for Cardano transaction signing and airlocked access to & from the outside world
---

## An encrypted, air-gapped Linux bootable USB drive for Cardano (and other) secure operations

Frankenwallet is not a package, library or product, but rather a set of installation guides, security standards and templates that allow Cardano SPOs, token minters, users with funds in bare addresses, and smart contract creators to configure an ordinary USB drive to boot Linux with a level of security isolation and software prerequisites appropriate to their use case.

When one's primary computer is booted from this removable drive, the secure ("cold") configuration & workflow conventions allow operators to:

  - store and work securely and flexibly with private keys
  - sign transactions and securely keep records of transaction details  
  - keep encrypted records & backups without ever revealing keys or passwords in the insecure host environment

:::warning warning - Linux veterans only

These instructions may be difficult or unsafe to follow unless you have experience with "dual boot" Linux installations and other custom OS & booting configurations.

Operators needing a safer path can follow instructions at the [Air Gap Environment](/docs/get-started/air-gap) page.

:::

### How to use this guide  

This tool has been developed by the [COSD stake pool](https://cexplorer.io/pool/pool1e98xlcgj80c3rdmm27v5hnvrdtut52e65uk0ema7ctfag596vr2), beginning as a publication of their own operating environment when scared to death of losing their pool pledge and not being able to come by a second machine for the conventional [air gap environment](/docs/get-started/air-gap) (see origin story: [Why was the Frankenwallet developed?](https://cosd.com/frankenwallet/intro/history)).

At the time of this writing, the full instructions for:

  - the reasons you would want to use this tool
  - how to provision & build your own Frankenwallet
  - how to use the tool for stake pool operations & secure transactions

… are in the online book at this external link: [The Frankenwallet](https://cosd.com/frankenwallet).  If you see any problems with this material, please submit an issue at:

  - [github:rphair/frankenwallet](https://github.com/rphair/frankenwallet) if you find an error in the material in the externally linked web site
  - [github:cardano-foundation/developer-portal](https://github.com/cardano-foundation/developer-portal) with any updates or corrections to this page itself.

This is a one-page summary of those external instructions to help you (the operator) decide if the Frankenwallet is something you might use in your workflow according to your own level of interest & expertise.

### Use cases for the Frankenwallet

➤ Anyone working with private keys & [secure transaction signing](/docs/get-started/secure-workflow), seed phrases, or other high value resources targeted by hackers (e.g., [stake pool keys](/docs/operate-a-stake-pool/cardano-key-pairs)).

➤ Anyone wishing to work in high security with these resources without either a second computer (e.g. perpetual travellers, students, and hardware minimalists) or a hardware wallet ([Why wouldn't I want a hardware wallet?](https://cosd.com/frankenwallet/intro/hardware-wallets))  

➤ Anyone wanting or needing direct access to all their own files on their main computer in the air-gapped environment.

➤ Anyone who has wondered how you might get the same (or better) features as a hardware wallet on an easily obtainable & anonymous USB drive: including a full featured operating system with applications that can edit encrypted and richly formatted files and prepare encrypted document archives.  

➤ Anyone using memory sticks to store or back up private keys who has worried about an unencrypted memory stick being lost or stolen.

➤ Anyone wanting to prepare an off-site or even a network backup of their keys, wallet seed phrases, and other cryptocurrency asset records… given that AES based encryption is considered unbreakable when properly used (i.e. never entering the passphrase on a network-connected machine).

### If so universally useful, why the build instructions & not just a downloadable ISO image?  

**TL;DR** because then all Frankenwallets would be the same, and any security flaw found in one of them might allow all of them to be exploited before a response could be mounted (see [Why is there no ISO image for Frankenwallet?](https://cosd.com/frankenwallet/intro/no-iso)).

### Some other use cases & limitations of this material

➤ You *can* use the Frankenwallet instructions to set up an Air Gap node on a full computer… but since the time of its development, this procedure has been adapted to a more appropriate page on the Dev Portal (the aforementioned [Air Gap Environment](/docs/get-started/air-gap)).

From [Frankenwallet \> Miscellaneous FAQ's](https://cosd.com/frankenwallet/intro/faq):

➤ Your VirtualBox or other VM software on your host computer *does not* isolate you from the network, even if you have the network device disabled… nor can it be ever assumed that the screen or keyboard are isolated either… so VMs are generally unsuitable to create an air gap *<span class="underline">or</span>* to implement these instructions.

➤ Ubuntu + GNOME, though heavyweight and tainted by default with proprietary software, are chosen for their universal documentation especially when it comes to issues of OS installation (_without_ that proprietary software!) and dual booting.

➤ Read more about the [Evil Maid](http://theinvisiblethings.blogspot.com/2009/01/why-do-i-miss-microsoft-bitlocker.html) to see what she, he, or it can & cannot do with your Frankenwallet by compromising your host computer's BIOS in a way to which all commercial computers are vulnerable.

## Preparing to build the Frankenwallet

From [Frankenwallet \> Preparation](https://cosd.com/frankenwallet/prepare):

#### Planning your communication with the host computer

You will avoid moving files around on memory sticks *<span class="underline">and</span>* transferring them over a network (impossible with Air Gap machines) because, when you boot from a USB device based operating system, the main disk on that computer is <span class="underline">*also*</span> accessible as if <span class="underline">*it*</span> were an external device.

Therefore you can plan an area on your host computer (called here the Host Folder) which the Frankenwallet will use to store any encrypted files… as well as read the raw data for the transactions that you will prepare in the air gapped environment.

:::warning warning

Remember early & often that nothing should be stored on the host computer that is not saved an encrypted document or archive.  

:::

### Procuring your hardware

Though regularly used Frankenwallets have been built on cheap & slow USB drives, to make this tool a dependable part of your workflow you should get either:

  - a memory stick with a high benchmark for reading <span class="underline">and writing</span> speed, or
  - (for best results in author's experience) a SATA SSD drive plus a SATA-to-USB adapter cable.

Users who have built dual-boot configurations before will also know you should **familiarise yourself with the computer's BIOS settings** in anticipation of the same type of setup.

Note there are <span class="underline">limitations about using a Mac</span> as host computer which stem from the different means of booting (see [Frankenwallet \> Hardware Requirements](https://cosd.com/frankenwallet/prepare/hardware) \> What if I have a Mac?).

### Choosing passwords

(from Frankenwallet passwords \> [low security](https://cosd.com/frankenwallet/prepare/password-low) & [high security](https://cosd.com/frankenwallet/prepare/password-high))  

The [low security password](https://cosd.com/frankenwallet/prepare/password-low) can be one you've already used to encrypt files on the host computer… strong enough you feel comfortable backing up files over the net.

The [high security password](https://cosd.com/frankenwallet/prepare/password-high)… called the Frankenwallet password itself… should also be strictly long & complex, but should never have been used in a network environment, not even on a network connected machine… otherwise you will be defeating the purpose of using the Air Gap for any purposes of file storage or backup of files to the host computer  

See each of these web links to see which of the Cardano asset & stake pool files it would typically be used to encrypt.

:::info optional

If you intend to use the ["cool" Frankenwallet](#the-cool-frankenwallet-a-sandbox-for-crypto-wallets) configuration (supporting light browser-based wallets) with a Chrome-based browser like Brave, you should be ready with a second high-security password used only to encrypt your most confidential data… since by default you will have to enter the user account password in the browser UI to unlock the GNOME keyring and therefore expose it in an uncertain security context.

:::

:::tip

For ease of use, you can separate the "low security" and "high security" stake pool files into two subdirectories, so they can be backed up as two separately password-encrypted archives.

::: 

## Installing the OS onto the USB device  

(from [Frankenwallet \> Host computer & media](https://cosd.com/frankenwallet/prepare/computer) though end of [Installation](https://cosd.com/frankenwallet/install) section)  

The full instructions mainly document the [installation of Ubuntu](https://ubuntu.com/tutorials/install-ubuntu-desktop#1-overview) in the common "dual boot" configuration: something the target audience should feel comfortable with, and can probably improvise for themselves if also following these checklists during the installation & setup or the installed environment:

### Installation notes: software  

No need to disconnect from the Internet yet because you will be using it to do your first package updates & software installation.

  - Purists might want to do this without Internet access at all: if feeling comfortable with the baseline OS alone (no upgrades) + getting your packages by saving them in your computer's & installing them from there.

Select the Minimal software installation (no network hungry apps & games) and plan to install the LibreOffice package later.

Don't tick **third party hardware for graphics and WiFi** because the proprietary vendor software provided for these devices can contain institutional spyware.

### Installation notes: partitioning

When you select **erase disk and install Ubuntu** you will get the options under Advanced Features for:

  - use LVM (the Logical Volume Manager), allowing more flexible disk usage
  - select Encrypt the new Ubuntu Installation
  - enter the "High Security" password you chose as the drive encryption password

Note the password you chose will be required now to boot the OS as well as decrypt the the partition it creates on any other devices (so your drive is secure when <span class="underline">not</span> booting).  

:::warning warning

At the next screen Erase disk and install Ubuntu, watch out that you don't accidentally select your computer's own drive… this can be very easy to do\!

:::

### Setup notes: operating system  

  - Don't let Ubuntu link with any online accounts in its initialisation process: refuse everything like location services, "livepatch", etc.
  - Disable lots of little services & settings which might leak your information (see [Frankenwallet \> First boot: Secure system settings](https://cosd.com/frankenwallet/install/settings))

### Setup notes: packages

(details: [Frankenwallet \> First boot: Package installation](https://cosd.com/frankenwallet/install/packages))  

 - Remove all "snaps" and disable Snap.
 - Remove CUPS (network printer service).
 - Disable unattended upgrades.
 - Upgrade the remainder of the system (`apt update; apt upgrade; apt autoremove`)

### Install document & security-oriented packages

  - `secure-delete` (in case you accidentally write unencrypted keys or secure data to your host computer drive)
  - `LibreOffice` (supporting AES256 encrypted documents)
  - `p7zip` (supporting AES256 encrypted archives)

### Tune browser & turn off network access FOREVER

Lock down the browser settings, just in case, even if you think you'll never use it ([Frankenwallet \> Securing Firefox browser](https://cosd.com/frankenwallet/install/browser))

At this point you disable Wi-Fi and all other networks in the system settings, and go on without any future connection to the Internet in your new environment.  

## What to use the Frankenwallet for

From a growing body of material beginning at [Frankenwallet \> Usage](https://cosd.com/frankenwallet/usage):

### Prepare and submit secure transactions

You can now follow the instructions recommended in [Secure Transaction Workflow](/docs/get-started/secure-workflow), with the following modifications:

  - Create a file on your networked host computer in the Host Folder, encrypted with the Low Security password (so you feel safe backing it up over the Internet, but won't store any keys or wallet passphrases there).
  - When planning your transaction, save the transaction details and any commands to cut-and-paste, in this file.
  - Boot into the Frankenwallet and navigate to your Host Folder.
  - Copy-paste the transaction commands and/or transaction data into the Frankenwallet command line.
  - Save the resulting transaction file to your Host Folder.
  - Reboot into the host computer, upload your transaction file if necessary, and submit it.

Some copy-paste models & templates for basic Cardano transactions are being assembled here: [Frankenwallet \> Transaction templates](https://cosd.com/frankenwallet/cardano/templates)

### Making & verifying backups of assets & keys  

from [Frankenwallet \> Backups to host machine](https://cosd.com/frankenwallet/usage/backups):

For [highly secure stake pool & asset files](https://cosd.com/frankenwallet/prepare/password-high), and any documents storing wallet key phrases or raw private key data:

  - First create the file archive (with 7z) or text document (with LibreOffice) using your "high security" password.
  - Then copy it to your host folder, where it can remain stored or backed up (over the network if desired) along with all your other computer's data.
  - This is safe (pending the usual arguments) because **you never have entered, and never will enter, the Frankenwallet (high security) password on your host computer <span class="underline">or</span> any other machine**.
  - This means you can only verify these backups on this or another Frankenwallet… never on the host computer environment itself\!  

For [less secure stake pool & asset files](https://cosd.com/frankenwallet/prepare/password-low), and documents with general transaction records & source data:

  - First create the file archive (with 7z) or text document (with LibreOffice) using your "high security" password.
  - These files you might feel comfortable verifying on your host computer.
  - NOTE for less urgently secure stake pool pool files (e.g. verification keys, operational certificate counters) you might provide a second dedicated password… with "security level" between your general encryption password and the "high security" password… which you only use for the purposes of your assets & stake pool public keys.  

### The "cool" Frankenwallet: a sandbox for crypto wallets

from [Frankenwallet \> Cool environments](https://cosd.com/frankenwallet/cool):

Relaxing the Internet environment (meaning **this device should no longer be used for cold, unencrypted key storage**) allows you to use this device for node- or browser-based wallets.

Even low-bandwidth memory sticks have been tested in use with the resource intensive Daedalus node wallet, and they still work.  But keep in mind that a node wallet will be considered very slow to sync… especially when your "daily driver" computer is booted from your Frankenwallet and can be used for no other purpose until booted normally again.

For browser-based wallets, the performance will be better… although the Firefox (or other browser) configuration becomes vital to avoid some institutional or extension spyware possibly compromising your keys.

In either case, you can still use the Frankenwallet to **copy the wallet key phrases to an encrypted file** on your host computer: so you can keep them encrypted with a password that has never been entered on your host machine.

Also keep in mind your security isolation can never be considered complete once you've allowed Internet connection from this "cool" environment… though this "sandbox" is still better than the complete exposure you'd have by running a node or browser based wallet on your network-connected, daily-use machine.
