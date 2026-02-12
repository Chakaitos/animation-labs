#!/bin/bash

# Video Optimization and Thumbnail Generation Script
# Optimizes MP4 videos for web and generates thumbnails at 5 seconds
# Usage: ./optimize-videos.sh [source_directory]

set -e  # Exit on error

# Configuration
CRF=20                    # Quality (18-23 is visually lossless)
PRESET="slow"             # Encoding speed vs compression (slow = better compression)
THUMBNAIL_TIME="00:00:05" # Extract thumbnail at 5 seconds
THUMBNAIL_QUALITY=2       # JPEG quality (2 = high, 31 = low)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get source directory (default to current directory)
SOURCE_DIR="${1:-.}"

# Create output directories
OUTPUT_DIR="$SOURCE_DIR/optimized"
THUMBNAIL_DIR="$SOURCE_DIR/thumbnails"
POSTER_DIR="$SOURCE_DIR/posters"

mkdir -p "$OUTPUT_DIR" "$THUMBNAIL_DIR" "$POSTER_DIR"

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Video Optimization Script${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo "Source: $SOURCE_DIR"
echo "Output: $OUTPUT_DIR"
echo "Thumbnails: $THUMBNAIL_DIR"
echo "Posters: $POSTER_DIR"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${RED}Error: ffmpeg is not installed${NC}"
    echo "Install with: brew install ffmpeg"
    exit 1
fi

# Count videos
VIDEO_COUNT=$(find "$SOURCE_DIR" -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" \) | wc -l | tr -d ' ')

if [ "$VIDEO_COUNT" -eq 0 ]; then
    echo -e "${RED}No video files found in $SOURCE_DIR${NC}"
    echo "Looking for: *.mp4, *.mov"
    exit 1
fi

echo -e "Found ${GREEN}$VIDEO_COUNT${NC} video(s) to process"
echo ""

# Process each video using find
CURRENT=0
find "$SOURCE_DIR" -maxdepth 1 -type f \( -iname "*.mp4" -o -iname "*.mov" \) | while read -r video; do
    # Skip if already in output directory
    [[ "$video" == *"/optimized/"* ]] && continue

    CURRENT=$((CURRENT + 1))
    BASENAME=$(basename "$video")
    FILENAME="${BASENAME%.*}"

    echo -e "${YELLOW}[$CURRENT/$VIDEO_COUNT]${NC} Processing: $BASENAME"

    # Get video duration to check if 5 seconds exists
    DURATION=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$video" 2>/dev/null || echo "0")
    DURATION_INT=${DURATION%.*}

    if [ "$DURATION_INT" -lt 5 ]; then
        echo -e "  ${YELLOW}⚠ Warning: Video is shorter than 5 seconds (${DURATION_INT}s), using middle frame${NC}"
        THUMBNAIL_TIME_USE="00:00:01"
    else
        THUMBNAIL_TIME_USE="$THUMBNAIL_TIME"
    fi

    # 1. Optimize video
    echo "  → Optimizing video..."
    if ffmpeg -i "$video" \
        -c:v libx264 \
        -crf $CRF \
        -preset $PRESET \
        -profile:v high \
        -pix_fmt yuv420p \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        "$OUTPUT_DIR/$FILENAME.mp4" \
        -y \
        -v quiet \
        -stats 2>&1; then

        # Get file sizes for comparison
        ORIGINAL_SIZE=$(du -h "$video" | cut -f1)
        OPTIMIZED_SIZE=$(du -h "$OUTPUT_DIR/$FILENAME.mp4" | cut -f1)

        echo -e "  ${GREEN}✓${NC} Optimized: $ORIGINAL_SIZE → $OPTIMIZED_SIZE"
    else
        echo -e "  ${RED}✗${NC} Failed to optimize video"
        continue
    fi

    # 2. Generate thumbnail at 5 seconds
    echo "  → Generating thumbnail at ${THUMBNAIL_TIME_USE}..."
    if ffmpeg -i "$video" \
        -ss $THUMBNAIL_TIME_USE \
        -vframes 1 \
        -q:v $THUMBNAIL_QUALITY \
        "$THUMBNAIL_DIR/$FILENAME-thumb.jpg" \
        -y \
        -v quiet 2>&1; then

        echo -e "  ${GREEN}✓${NC} Thumbnail: $FILENAME-thumb.jpg"
    else
        echo -e "  ${RED}✗${NC} Failed to generate thumbnail"
    fi

    # 3. Generate poster frame (first frame)
    echo "  → Generating poster frame..."
    if ffmpeg -i "$video" \
        -ss 00:00:00.5 \
        -vframes 1 \
        -q:v $THUMBNAIL_QUALITY \
        "$POSTER_DIR/$FILENAME-poster.jpg" \
        -y \
        -v quiet 2>&1; then

        echo -e "  ${GREEN}✓${NC} Poster: $FILENAME-poster.jpg"
    else
        echo -e "  ${RED}✗${NC} Failed to generate poster"
    fi

    echo ""
done

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}Processing Complete!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo "Results:"
echo "  • Optimized videos: $OUTPUT_DIR"
echo "  • Thumbnails (5s):  $THUMBNAIL_DIR"
echo "  • Posters (0s):     $POSTER_DIR"
echo ""
echo "Next steps:"
echo "  1. Review quality of optimized videos"
echo "  2. Move files to public/examples/"
echo "  3. Update app/examples/_data/examples.ts with new filenames"
echo ""
