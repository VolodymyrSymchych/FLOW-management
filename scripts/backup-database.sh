#!/bin/bash

# Database backup script
# Backs up all PostgreSQL databases used by microservices

set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Creating database backups..."

mkdir -p "$BACKUP_DIR"

# List of databases to backup
DATABASES=(
  "auth_db:auth_user:auth_password:5432"
  "user_db:user_user:user_password:5433"
  "project_db:project_user:project_password:5434"
  "task_db:task_user:task_password:5435"
  "financial_db:financial_user:financial_password:5436"
)

for db_info in "${DATABASES[@]}"; do
  IFS=':' read -r db_name db_user db_password db_port <<< "$db_info"
  
  echo "Backing up $db_name..."
  
  PGPASSWORD="$db_password" pg_dump \
    -h localhost \
    -p "$db_port" \
    -U "$db_user" \
    -d "$db_name" \
    -F c \
    -f "$BACKUP_DIR/${db_name}_${TIMESTAMP}.dump"
  
  echo "✓ Backed up $db_name"
done

echo "All backups completed!"
echo "Backups saved to: $BACKUP_DIR"

