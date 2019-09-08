#!/bin/bash

cd /usr/local/auth/
pm2-docker start "dist/index.js" -i 0