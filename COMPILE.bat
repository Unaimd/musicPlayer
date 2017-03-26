@echo off
title Compile musicPlayer
electron-packager ./src musicPlayer --electron-version=1.4.15 --out=. --all --overwrite