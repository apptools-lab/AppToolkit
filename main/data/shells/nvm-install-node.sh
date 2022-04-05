#!/usr/bin/env bash

\. "$NVM_DIR/nvm.sh"

NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node nvm install $1
nvm alias default $1

# echo the new version node path
NODE_PATH="$(which node)"
echo "Current Node Path: $NODE_PATH."
NPM_VERSION="$(npm --version)"
echo "Current NPM Version: $NPM_VERSION."
