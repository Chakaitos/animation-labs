# Video Optimization Guide

## Quick Start

1. **Place your original videos** in a folder (e.g., `~/Downloads/raw-videos/`)

2. **Run the script**:
   ```bash
   ./optimize-videos.sh ~/Downloads/raw-videos
   ```

   Or if videos are in the current directory:
   ```bash
   ./optimize-videos.sh
   ```

3. **Check the output** in three folders:
   - `optimized/` - Compressed videos
   - `thumbnails/` - Thumbnails at 5 seconds
   - `posters/` - Poster frames at start

## What the Script Does

### Video Optimization
- **Codec**: H.264 (maximum browser compatibility)
- **Quality**: CRF 20 (visually lossless)
- **Compression**: Slow preset (best quality/size ratio)
- **Audio**: Removed (logo animations don't need it)
- **Fast start**: Enabled for progressive loading
- **Expected result**: 60-70% size reduction with no visible quality loss

### Thumbnails
- **Extracted at**: 5 seconds (or middle if video is shorter)
- **Format**: JPEG (high quality)
- **Filename pattern**: `[video-name]-thumb.jpg`

### Posters
- **Extracted at**: 0.5 seconds (first frame)
- **Format**: JPEG (high quality)
- **Filename pattern**: `[video-name]-poster.jpg`
- **Purpose**: Used as video placeholder before playback

## Example Workflow

```bash
# 1. Navigate to project
cd ~/AnimateLabs

# 2. Process videos
./optimize-videos.sh ~/Downloads/my-logo-animations

# 3. Review output
ls ~/Downloads/my-logo-animations/optimized
ls ~/Downloads/my-logo-animations/thumbnails
ls ~/Downloads/my-logo-animations/posters

# 4. Move to public directory
mkdir -p public/examples
cp ~/Downloads/my-logo-animations/optimized/*.mp4 public/examples/
cp ~/Downloads/my-logo-animations/thumbnails/*.jpg public/examples/
cp ~/Downloads/my-logo-animations/posters/*.jpg public/examples/

# 5. Update examples data
# Edit app/examples/_data/examples.ts with new filenames
```

## Customization

Edit the script to adjust settings:

```bash
CRF=20                    # Quality (lower = better, 18-23 recommended)
PRESET="slow"             # Speed vs compression
THUMBNAIL_TIME="00:00:05" # When to extract thumbnail
THUMBNAIL_QUALITY=2       # JPEG quality (2 = high, 31 = low)
```

## File Naming Convention

If your video is named: `modern-tech-fade.mp4`

Output will be:
- `modern-tech-fade.mp4` (optimized video)
- `modern-tech-fade-thumb.jpg` (thumbnail)
- `modern-tech-fade-poster.jpg` (poster frame)

This matches the structure expected in `app/examples/_data/examples.ts`:

```typescript
{
  id: 'modern-tech-fade',
  videoUrl: '/examples/modern-tech-fade.mp4',
  thumbnailUrl: '/examples/modern-tech-fade-thumb.jpg',
  posterUrl: '/examples/modern-tech-fade-poster.jpg',
  // ...
}
```

## Troubleshooting

### ffmpeg not found
```bash
brew install ffmpeg
```

### Video too short for 5-second thumbnail
The script automatically adjusts to extract from the middle of short videos.

### Quality not good enough
Decrease the CRF value (try 18 instead of 20).

### Files still too large
Try Option 2 from the main guide (scale to 720p):
```bash
# Add this line after -crf $CRF:
-vf "scale=1280:720" \
```

### Need to re-process single video
```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 20 -preset slow \
  -profile:v high -pix_fmt yuv420p \
  -movflags +faststart -an \
  output.mp4
```

## Requirements

- macOS/Linux (for bash script)
- ffmpeg installed (`brew install ffmpeg`)
- Source videos in MP4 or MOV format
