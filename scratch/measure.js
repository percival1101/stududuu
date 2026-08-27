const fs = require('fs');
const path = require('path');

// We can read PNG file pixels using a simple script if we have pngjs or we can use browser canvas
const html = `
<!DOCTYPE html>
<html>
<body>
<canvas id="cv"></canvas>
<script>
const img = new Image();
img.src = '/stududu-logo-user.png';
img.onload = () => {
  const cv = document.getElementById('cv');
  cv.width = img.width;
  cv.height = img.height;
  const ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const d = ctx.getImageData(0, 0, img.width, img.height).data;
  let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
  
  // Find bounding box for entire logo content excluding trailing dash
  // The trailing dash is around X > 700
  let textMaxX = 0;

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = d[idx], g = d[idx+1], b = d[idx+2], a = d[idx+3];
      if (r < 230 || g < 230 || b < 230) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (x < 750 && x > textMaxX) textMaxX = x;
      }
    }
  }

  console.log("Entire bounding box:", { minX, minY, maxX, maxY, textMaxX });
};
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'measure.js'), html);
