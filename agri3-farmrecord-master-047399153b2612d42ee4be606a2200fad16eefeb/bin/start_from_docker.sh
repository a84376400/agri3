#!/bin/bash

cd /app
pm2-docker start "dist/index.js" -i 0