#!/bin/bash

# Base directory for code execution
BASE_DIR="./code-executor"

# Array of supported languages
LANGUAGES=(
    "c"
    "cpp"
    "csharp"
    "java"
    "python3"
    "node"
    "typescript"
    "php"
    "swift"
    "kotlin"
    "ruby"
    "scala"
    "rust"
)

# Create base directory if it doesn't exist
mkdir -p "$BASE_DIR"

# Create directories for each language
for lang in "${LANGUAGES[@]}"; do
    lang_dir="$BASE_DIR/$lang"
    mkdir -p "$lang_dir"
    echo "Created directory: $lang_dir"
done

# Set appropriate permissions
chmod -R 755 "$BASE_DIR"

echo "All language directories have been created successfully!"