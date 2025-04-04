#!/bin/bash

ZIP_URL="https://github.com/hisproc/transmission-next-ui/releases/latest/download/release.zip"
DOCKER_COMPOSE_URL="https://raw.githubusercontent.com/hisproc/transmission-next-ui/main/docker-compose.yml"
DEST_DIR="./web/src"
TMP_ZIP="tmp.zip"

mkdir -p "$DEST_DIR"

curl -L -o "$TMP_ZIP" "$ZIP_URL"

unzip -o "$TMP_ZIP" -d "$DEST_DIR"

rm "$TMP_ZIP"

if [ ! -f "docker-compose.yml" ]; then
  curl -L -o "docker-compose.yml" "$DOCKER_COMPOSE_URL"
else
  echo "docker-compose.yml already exists, skipping download."
fi