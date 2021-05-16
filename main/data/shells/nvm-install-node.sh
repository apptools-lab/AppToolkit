#!/usr/bin/env bash

source "$NVM_DIR/nvm.sh"
NVM_NODEJS_ORG_MIRROR=http://npm.taobao.org/mirrors/node nvm install $1 $2
nvm use $1
nvm alias default $1
