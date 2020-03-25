#!/bin/sh

sudo git --git-dir /vol/data/neon_nodejs_api/.git  pull

sudo find /vol/data/neon_nodejs_api -type d -exec chmod 770 {} +
sudo find /vol/data/neon_nodejs_api -type f -exec chmod 464 {} +
echo "success"
