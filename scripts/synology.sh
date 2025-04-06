#!/bin/bash

set -e

RELEASE_ZIP="release.zip"
TARGET_SUBPATH="/@appstore/transmission/share/transmission/public_html"

# 查找目标路径
for vol in /volume*; do
  TARGET_PATH="$vol$TARGET_SUBPATH"
  if [ -d "$TARGET_PATH" ]; then
    echo "✅ Found transmission web path at: $TARGET_PATH"

    # 备份当前目录内容
    BACKUP_ZIP="./backup.zip"
    echo "🗂️  Backing up current contents to $BACKUP_ZIP"
    rm -f "$BACKUP_ZIP"
    cd "$TARGET_PATH"
    zip -r "$OLDPWD/backup.zip" ./*
    cd - > /dev/null

    # 清空目标目录
    echo "🧹 Clearing old files..."
    rm -rf "$TARGET_PATH"/*

    # 解压 release.zip 到目标目录
    echo "📦 Unzipping release.zip to $TARGET_PATH"
    unzip -o "$RELEASE_ZIP" -d "$TARGET_PATH"

    # 修改权限（让群辉 web 服务能访问）
    echo "🔐 Setting permissions..."
    chmod -R 755 "$TARGET_PATH"

    echo "✅ Deployment complete!"
    exit 0
  fi
done

echo "❌ No valid Transmission public_html path found."
exit 1
