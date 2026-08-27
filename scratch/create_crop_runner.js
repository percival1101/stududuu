const fs = require('fs');
const path = require('path');

// Let's create an HTML file that uses browser canvas to process the images cleanly
const html = `
<!DOCTYPE html>
<html>
<body>
<canvas id="canvasIcon"></canvas>
<canvas id="canvasLogo"></canvas>
<script>
async function processImage(src, targetCanvas, cropBox, makeTransparent = true) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.getElementById(targetCanvas);
      canvas.width = cropBox.w;
      canvas.height = cropBox.h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cropBox.w, cropBox.h);

      if (makeTransparent) {
        const imgData = ctx.getImageData(0, 0, cropBox.w, cropBox.h);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          // If pixel is near white (r > 245, g > 245, b > 245), make alpha 0
          if (data[i] > 240 && data[i+1] > 240 && data[i+2] > 240) {
            data[i+3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = src;
  });
}

window.runProcessing = async function() {
  // Crop coordinates for Icon and Logo
  const iconData = await processImage('/stududu-icon-user.png', 'canvasIcon', { x: 45, y: 70, w: 185, h: 185 }, true);
  const logoData = await processImage('/stududu-logo-user.png', 'canvasLogo', { x: 70, y: 15, w: 910, h: 260 }, true);

  return { iconData, logoData };
};
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'crop_runner.html'), html);
console.log("HTML runner created");
