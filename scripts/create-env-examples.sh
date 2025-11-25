#!/bin/bash

# Script to create .env.example files from .env files
# This removes all actual secret values and replaces them with placeholders

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Creating .env.example files from existing .env files...${NC}"

# Function to sanitize env file
sanitize_env_file() {
    local input_file=$1
    local output_file=$2

    if [ ! -f "$input_file" ]; then
        echo -e "${YELLOW}Warning: $input_file not found, skipping...${NC}"
        return
    fi

    echo -e "${GREEN}Processing: $input_file -> $output_file${NC}"

    # Read the file and replace values
    while IFS= read -r line; do
        # Skip empty lines and comments
        if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
            echo "$line" >> "$output_file"
            continue
        fi

        # Extract key and value
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"

            # Replace with placeholder based on key type
            case "$key" in
                *_SECRET*|*_KEY*|*PASSWORD*|*_TOKEN*)
                    echo "${key}=your-secret-here" >> "$output_file"
                    ;;
                *DATABASE_URL*|*REDIS_URL*)
                    echo "${key}=your-database-url-here" >> "$output_file"
                    ;;
                *CLIENT_ID*)
                    echo "${key}=your-client-id-here" >> "$output_file"
                    ;;
                *EMAIL*)
                    echo "${key}=your-email@example.com" >> "$output_file"
                    ;;
                *URL*|*ENDPOINT*)
                    echo "${key}=https://your-url-here.com" >> "$output_file"
                    ;;
                NODE_ENV)
                    echo "${key}=development" >> "$output_file"
                    ;;
                PORT)
                    echo "${key}=3000" >> "$output_file"
                    ;;
                *)
                    echo "${key}=your-value-here" >> "$output_file"
                    ;;
            esac
        else
            echo "$line" >> "$output_file"
        fi
    done < "$input_file"

    echo -e "${GREEN}✓ Created: $output_file${NC}\n"
}

# Create directory for examples if needed
mkdir -p scripts

# Dashboard
if [ -f "dashboard/.env.local" ]; then
    > "dashboard/.env.example"  # Clear existing file
    sanitize_env_file "dashboard/.env.local" "dashboard/.env.example"
fi

# Auth Service
if [ -f "services/auth-service/.env" ]; then
    > "services/auth-service/.env.example"
    sanitize_env_file "services/auth-service/.env" "services/auth-service/.env.example"
fi

# Root .env
if [ -f ".env" ]; then
    > ".env.example"
    sanitize_env_file ".env" ".env.example"
fi

echo -e "${GREEN}Done! Remember to:${NC}"
echo -e "1. ${RED}NEVER commit actual .env files${NC}"
echo -e "2. ${YELLOW}Review .env.example files before committing${NC}"
echo -e "3. ${GREEN}Add .env to .gitignore (already done)${NC}"
