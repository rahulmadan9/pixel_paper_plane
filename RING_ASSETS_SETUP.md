# Ring Assets Setup Guide

## Required Assets

You need to save your uploaded assets to the following locations in your project:

### 1. Create the assets directory structure:
```
public/
  assets/
    sprites/
      plane_right.png
      ring_gold.png
      ring_silver.png  
      ring_bronze.png
```

### 2. Save the uploaded images:

1. **Plane Sprite**: Save the plane image as:
   - `public/assets/sprites/plane_right.png`

2. **Bronze Ring**: Save the bronze ring image as:
   - `public/assets/sprites/ring_bronze.png`

3. **Silver Ring**: Save the silver ring image as:
   - `public/assets/sprites/ring_silver.png`

4. **Gold Ring**: Save the gold ring image as:
   - `public/assets/sprites/ring_gold.png`

### 3. Asset Requirements:
- All images should be PNG format with transparency
- All images are 64×64 pixels (single-frame sprite-sheets)
- Make sure the images have transparent backgrounds

### 4. After placing the assets:
1. Restart your development server (`npm run dev`)
2. The game should now use your custom sprites instead of generated graphics
3. You should see the plane sprite and bronze, silver, and gold rings appearing with their respective point values

## Asset Loading
The game now loads these assets in the BootScene:
- `plane` → plane_right.png (paper plane sprite)
- `ringBronze` → ring_bronze.png (20 points, 70% spawn rate)
- `ringSilver` → ring_silver.png (50 points, 25% spawn rate)  
- `ringGold` → ring_gold.png (100 points, 5% spawn rate)

## Troubleshooting
If assets appear as black boxes or don't appear:
1. Check that file paths are correct: `public/assets/sprites/`
2. Make sure files are PNG format with exact names
3. Verify files are 64×64 pixels
4. Restart the development server
5. Check browser console for loading errors 