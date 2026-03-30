#!/bin/bash

# --- Config ---
REPO="hisproc/transmission-next-ui"
API_URL="https://api.github.com/repos/$REPO/releases?per_page=5"
DOCKER_COMPOSE_URL="https://raw.githubusercontent.com/$REPO/main/docker-compose.yml"
DEST_DIR="./web/src"
TMP_ZIP="tmp.zip"

# --- Dependency Check ---
for cmd in curl unzip grep sed; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "❌ Error: '$cmd' is required but not installed. Please install it." >&2
        exit 1
    fi
done

echo "🔍 Fetching latest versions from $REPO..."

# Fetch last 5 versions using curl and basic regex (no jq dependency)
RELEASES_RAW=$(curl -s "$API_URL")
TAGS=$(echo "$RELEASES_RAW" | grep '"tag_name":' | sed -E 's/.*"tag_name": "([^"]+)".*/\1/')

if [ -z "$TAGS" ]; then
    echo "❌ Error: Could not fetch releases. Using fallback (latest)."
    TAG_NAME="latest"
    ZIP_URL="https://github.com/$REPO/releases/latest/download/release.zip"
else
    # Convert to array
    TAG_ARRAY=($TAGS)
    
    # Check if interactive
    if [ -t 0 ]; then
        echo ""
        echo "🚀 Please select a version to install:"
        for i in "${!TAG_ARRAY[@]}"; do
            echo "  $((i+1))) ${TAG_ARRAY[$i]} $( [ $i -eq 0 ] && echo "(latest)" )"
        done
        echo "  c) Cancel"
        echo ""
        read -p "Selection [1-${#TAG_ARRAY[@]}]: " choice

        if [[ "$choice" == "c" ]]; then
            echo "Cancelled."
            exit 0
        fi

        # Default to 1 if enter is pressed
        if [ -z "$choice" ]; then choice=1; fi

        # Validate choice
        if [[ "$choice" =~ ^[1-5]$ ]] && [ "$choice" -le "${#TAG_ARRAY[@]}" ]; then
            SELECTED_TAG="${TAG_ARRAY[$((choice-1))]}"
            TAG_NAME="$SELECTED_TAG"
            ZIP_URL="https://github.com/$REPO/releases/download/$TAG_NAME/release.zip"
        else
            echo "⚠️  Invalid choice, using latest version: ${TAG_ARRAY[0]}"
            TAG_NAME="${TAG_ARRAY[0]}"
            ZIP_URL="https://github.com/$REPO/releases/download/$TAG_NAME/release.zip"
        fi
    else
        # Non-interactive mode, use latest
        TAG_NAME="${TAG_ARRAY[0]}"
        ZIP_URL="https://github.com/$REPO/releases/download/$TAG_NAME/release.zip"
    fi
fi

echo "📦 Selected version: $TAG_NAME"
echo "📥 Downloading UI assets..."

mkdir -p "$DEST_DIR"
if curl -L -f -o "$TMP_ZIP" "$ZIP_URL"; then
    echo "📂 Extracting to $DEST_DIR..."
    unzip -q -o "$TMP_ZIP" -d "$DEST_DIR"
    rm "$TMP_ZIP"
    echo "✨ UI installed successfully!"
else
    echo "❌ Error: Failed to download $ZIP_URL"
    exit 1
fi

# Docker Compose check
if [ ! -f "docker-compose.yml" ]; then
    echo "📥 Downloading docker-compose.yml..."
    curl -L -s -o "docker-compose.yml" "$DOCKER_COMPOSE_URL"
    echo "✅ docker-compose.yml created."
else
    echo "ℹ️  docker-compose.yml already exists, skipping download."
fi

echo ""
echo "🎉 Setup complete! You can now start the service with:"
echo "   docker-compose up -d"
echo ""