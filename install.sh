#!/bin/bash
cd ~

curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt install nodejs -y
rm nodesource_setup.sh

mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo " export PATH=~/.npm-global/bin:$PATH" >> ~/.profile
source ~/.profile

npm install -g pm2

sudo setcap cap_net_bind_service=+ep /usr/bin/node

git clone https://github.com/SirMorfield/joppekoers.nl.git
cd joppekoers.nl/

npm install
