#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./scale-bots.sh <number_of_bots>"
  exit 1
fi

REPLICAS=$1

sudo docker compose up -d --scale minecraft-bot=$REPLICAS