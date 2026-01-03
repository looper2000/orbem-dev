// pixel-effect.js

if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP and ScrollTrigger must be loaded.');
  } else {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  let pixelMap = [];
  let animationState = { pixelSize: 1, whiteFactor: 0 };
  let isTwinkling = false;
  let ctx;
  let canvas;
  
  // CONFIGURATION
  const GLOBAL_MISSING_PERCENTAGE = 0.4;
  const MAX_PIXEL_SIZE = 100;
  const ALPHA_THRESHOLD = 20;
  
  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    const sourceImage = document.querySelector('img.hero_modal-image.is-4');
    if (!sourceImage) {
      console.warn("Target image 'img.hero_modal-image.is-4' not found.");
    } else {
      initCanvasReplacement(sourceImage);
    }
  });
  
  function initCanvasReplacement(originalImg) {
    const proxyImg = new Image();
    proxyImg.crossOrigin = "Anonymous";
    proxyImg.onload = function () {
      setupCanvas(originalImg, proxyImg);
    };
    proxyImg.onerror = function () {
      console.error("CORS Error: Ensure server supports Access-Control-Allow-Origin.");
    };
    proxyImg.src = originalImg.src + '?t=' + new Date().getTime();
  }
  
  function setupCanvas(originalImg, loadedImg) {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;
    canvas.className = originalImg.className;
    canvas.style.cssText = originalImg.style.cssText;
    if (originalImg.parentNode) {
      originalImg.parentNode.insertBefore(canvas, originalImg);
      originalImg.style.display = 'none';
    }
    generatePixelData(loadedImg);
    startScrollAnimation();
  }
  
  function generatePixelData(img) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
    function analyzeCell(x0, y0, cellW, cellH) {
      const sampleStep = Math.max(1, Math.floor(Math.min(cellW, cellH) / 8));
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let y = y0; y < y0 + cellH; y += sampleStep) {
        if (y >= canvas.height) break;
        for (let x = x0; x < x0 + cellW; x += sampleStep) {
          if (x >= canvas.width) break;
          const idx = (y * canvas.width + x) * 4;
          if (imageData.data[idx + 3] < ALPHA_THRESHOLD) continue;
          const r = imageData.data[idx];
          const g = imageData.data[idx + 1];
          const b = imageData.data[idx + 2];
          rSum += r; gSum += g; bSum += b;
          count++;
        }
      }
      if (count === 0) return null;
      return {
        r: rSum / count,
        g: gSum / count,
        b: bSum / count
      };
    }
    pixelMap = [];
    for (let gridY = 0; gridY < Math.ceil(canvas.height / MAX_PIXEL_SIZE); gridY++) {
      for (let gridX = 0; gridX < Math.ceil(canvas.width / MAX_PIXEL_SIZE); gridX++) {
        const cellX = gridX * MAX_PIXEL_SIZE;
        const cellY = gridY * MAX_PIXEL_SIZE;
        const cellW = Math.min(MAX_PIXEL_SIZE, canvas.width - cellX);
        const cellH = Math.min(MAX_PIXEL_SIZE, canvas.height - cellY);
        const color = analyzeCell(cellX, cellY, cellW, cellH);
        if (!color) continue;
        const shouldHideInitially = Math.random() < GLOBAL_MISSING_PERCENTAGE;
        pixelMap.push({
          gridX,
          gridY,
          color: color,
          isHiddenInitially: shouldHideInitially,
          currentAlpha: shouldHideInitially ? 0 : 1,
          targetAlpha: shouldHideInitially ? 0 : 1,
          speed: 0.01 + Math.random() * 0.09,
          waitTimer: Math.random() * 200
        });
      }
    }
    drawPixelsScroll(animationState.pixelSize, animationState.whiteFactor);
  }
  
  function drawPixelsScroll(currentPixelSize, whiteFactor) {
    if (isTwinkling) return;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const size = Math.max(1, Math.round(currentPixelSize));
    for (let i = 0; i < pixelMap.length; i++) {
      const p = pixelMap[i];
      if (p.isHiddenInitially) continue;
      const baseX = p.gridX * MAX_PIXEL_SIZE;
      const baseY = p.gridY * MAX_PIXEL_SIZE;
      const offsetX = baseX + (MAX_PIXEL_SIZE - size) / 2;
      const offsetY = baseY + (MAX_PIXEL_SIZE - size) / 2;
      const r = Math.round(p.color.r + (255 - p.color.r) * whiteFactor);
      const g = Math.round(p.color.g + (255 - p.color.g) * whiteFactor);
      const b = Math.round(p.color.b + (255 - p.color.b) * whiteFactor);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(offsetX, offsetY, size, size);
    }
  }
  
  function twinkleLoop() {
    if (!isTwinkling || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    for (let i = 0; i < pixelMap.length; i++) {
      const p = pixelMap[i];
      const diff = p.targetAlpha - p.currentAlpha;
      if (Math.abs(diff) < 0.01) {
        p.currentAlpha = p.targetAlpha;
        if (p.waitTimer > 0) {
          p.waitTimer--;
        } else {
          p.targetAlpha = Math.random() > 0.7 ? 1 : 0;
          p.waitTimer = 20 + Math.random() * 130;
        }
      } else {
        p.currentAlpha += diff * p.speed;
      }
      if (p.currentAlpha > 0.01) {
        const x = p.gridX * MAX_PIXEL_SIZE;
        const y = p.gridY * MAX_PIXEL_SIZE;
        ctx.globalAlpha = p.currentAlpha;
        ctx.fillRect(x, y, MAX_PIXEL_SIZE, MAX_PIXEL_SIZE);
      }
    }
    ctx.globalAlpha = 1;
  }
  
  function startScrollAnimation() {
    const scrollMap = window.scrollMap; // Access global config
    if(!scrollMap) { console.error("Config.js not loaded!"); return; }
  
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[6].start,
        end: scrollMap.scrollTriggers[6].end,
        scrub: true,
        onUpdate: (self) => {
          if (animationState.whiteFactor >= 0.99) {
            if (!isTwinkling) startTwinkle();
          } else {
            if (isTwinkling) stopTwinkle();
            drawPixelsScroll(animationState.pixelSize, animationState.whiteFactor);
          }
        }
      }
    });
    tl.to(animationState, {
      pixelSize: MAX_PIXEL_SIZE,
      duration: 1,
      ease: 'none'
    })
    .to(animationState, {
      whiteFactor: 1,
      duration: 1,
      ease: 'none'
    });
  }
  
  function startTwinkle() {
    isTwinkling = true;
    gsap.ticker.add(twinkleLoop);
  }
  
  function stopTwinkle() {
    isTwinkling = false;
    gsap.ticker.remove(twinkleLoop);
    pixelMap.forEach(p => {
      p.currentAlpha = p.isHiddenInitially ? 0 : 1;
      p.targetAlpha = p.isHiddenInitially ? 0 : 1;
      p.waitTimer = Math.random() * 50;
    });
  }