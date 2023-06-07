#!/usr/bin/env bash

set -euo pipefail

input_dir="videos/h264_aac"
fragment_dir="videos/fragmented"
output_dir="output"

# Create the output directory if it doesn't exist
mkdir -p "$fragment_dir"
mkdir -p "$output_dir"

# Loop through each MP4 file in the input directory
for file in "$input_dir"/*.mp4; do
    echo "Generating manifest for single file: $file"

    # Get the filename without the extension
    filename=$(basename "$file" .mp4)
    
    # Fragment the MP4 file using mp4fragment
    mp4fragment "$file" "$fragment_dir/$filename.mp4"

    # Create single period manifest
    mp4dash -f \
        --profiles=urn:mpeg:dash:profile:isoff-main:2011 \
        --use-segment-timeline \
        --min-buffer-time=8 \
        -o "$output_dir/$filename" \
        "$fragment_dir/$filename.mp4"

    echo -e "\n"
done
