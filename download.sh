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

# Fetch last 5 versions using curl and basic regex
RELEASES_RAW=$(curl -s "$API_URL")
TAGS=$(echo "$RELEASES_RAW" | grep '"tag_name":' | sed -E 's/.*"tag_name": "([^"]+)".*/\1/')

if [ -z "$TAGS" ]; then
    echo "❌ Error: Could not fetch releases. Using fallback (latest)."
    TAG_NAME="latest"
    ZIP_URL="https://github.com/$REPO/releases/latest/download/release.zip"
else
    # Convert to positional parameters (POSIX compatible array)
    set -- $TAGS
    COUNT=$#
    
    # Check if interactive
    if [ -t 0 ]; then
        echo ""
        echo "🚀 Please select a version to install:"
        i=1
        for tag in "$@"; do
            if [ "$i" -eq 1 ]; then
                echo "  $i) $tag (latest)"
            else
                echo "  $i) $tag"
            fi
            i=$((i+1))
        done
        echo "  c) Cancel"
        echo ""
        printf "Selection [1-$COUNT]: "
        read choice

        if [ "$choice" = "c" ]; then
            echo "Cancelled."
            exit 0
        fi

        # Default to 1 if enter is pressed
        if [ -z "$choice" ]; then choice=1; fi

        # Validate and get tag
        case "$choice" in
            1) TAG_NAME="$1" ;;
            2) TAG_NAME="$2" ;;
            3) TAG_NAME="$3" ;;
            4) TAG_NAME="$4" ;;
            5) TAG_NAME="$5" ;;
            *) 
               echo "⚠️  Invalid choice, using latest version: $1"
               TAG_NAME="$1" 
               ;;
        esac
    else
        # Non-interactive mode, use latest
        TAG_NAME="$1"
    fi
    ZIP_URL="https://github.com/$REPO/releases/download/$TAG_NAME/release.zip"
fi

echo "📦 Selected version: $TAG_NAME"
echo "📥 Downloading UI assets..."

if curl -L -f -o "$TMP_ZIP" "$ZIP_URL"; then
    mkdir -p "$DEST_DIR"
    
    # --- Backup and Clean ---
    if [ -d "$DEST_DIR" ] && [ "$(ls -A "$DEST_DIR" 2>/dev/null)" ]; then
        BACKUP_TS=$(date +%Y%m%d_%H%M%S)
        BACKUP_ROOT="./web"
        BACKUP_PATH="$BACKUP_ROOT/backup_$BACKUP_TS"
        
        # Remove old backups before creating new one
        if [ -t 0 ]; then
            B_COUNT=$(find "$BACKUP_ROOT" -maxdepth 1 -type d -name "backup_*" | grep -c "backup_")
            if [ "$B_COUNT" -gt 0 ]; then
                printf "⚠️  Found $B_COUNT old backup(s) in $BACKUP_ROOT. Delete them? [y/N]: "
                read confirm
                case "$confirm" in
                    [Yy]*) 
                        find "$BACKUP_ROOT" -maxdepth 1 -type d -name "backup_*" -exec rm -rf {} +
                        echo "🧹 Old backups removed."
                        ;;
                    *)
                        echo "⏭️  Keeping old backups."
                        ;;
                esac
            fi
        else
            find "$BACKUP_ROOT" -maxdepth 1 -type d -name "backup_*" -exec rm -rf {} +
        fi
        
        echo "📦 Existing UI detected. Backing up to $BACKUP_PATH..."
        mkdir -p "$BACKUP_PATH"
        cp -r "$DEST_DIR"/* "$BACKUP_PATH/" 2>/dev/null
        
        echo "🧹 Cleaning $DEST_DIR for a fresh install..."
        rm -rf "${DEST_DIR:?}"/*
    fi

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