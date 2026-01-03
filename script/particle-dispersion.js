// particle-dispersion.js

(function () {
    const svg = document.getElementById('sourceSVG');
    const canvas = document.getElementById('scene');
    
    if (!svg || !canvas) {
      console.warn('sourceSVG or scene element not found.');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;
    const logoPathData = "M2.61187 0.000244141C4.05365 0.000244141 5.22333 1.16995 5.22333 2.61173C5.22333 4.05351 4.05365 5.22321 2.61187 5.22321C1.17009 5.22321 0 4.05388 0 2.61173C0 1.16995 1.17009 0.000244141 2.61187 0.000244141ZM3.37031 1.75591C3.31219 1.71852 3.24447 1.78628 3.28111 1.84402C3.64609 2.41222 3.58833 3.31024 2.95609 3.80551C2.89724 3.85141 2.9609 3.94024 3.02938 3.90989C3.96922 3.49753 4.06917 2.24749 3.37031 1.75591ZM1.71904 1.34614C1.70794 1.35133 1.69608 1.35652 1.68497 1.36207C0.682578 1.84846 0.693678 3.37426 1.68904 3.81586C1.71421 3.82696 1.74013 3.83733 1.76604 3.84659L1.84597 3.87214C2.10471 3.94432 2.38755 3.92692 2.63112 3.81254V3.81068C3.07531 3.59969 3.3392 3.12736 3.33809 2.63023C3.33772 2.29561 3.25333 1.98136 3.04308 1.74075C3.00643 1.69855 2.95649 1.66857 2.89726 1.70411C2.82619 1.74667 2.85765 1.80921 2.88208 1.85326C3.14785 2.3304 3.15746 3.15402 2.59185 3.5686C2.35421 3.74258 1.9526 3.75367 1.69089 3.54712C1.0668 3.05628 1.10308 2.02096 1.79121 1.45165C1.83044 1.41908 1.81342 1.36688 1.77751 1.34764C1.76086 1.33875 1.74014 1.33689 1.71904 1.34614ZM3.37808 1.38279C3.11934 1.31098 2.83655 1.32801 2.59298 1.44239V1.4446C2.14879 1.65523 1.88525 2.12793 1.88673 2.62506C1.8871 2.95968 1.97073 3.27359 2.18098 3.51456C2.21762 3.55676 2.26833 3.58673 2.32756 3.55082C2.39826 3.50825 2.36645 3.4457 2.34202 3.40203C2.07624 2.92489 2.06697 2.10165 2.6322 1.68707C2.86985 1.5131 3.27186 1.50125 3.53357 1.70817C4.15766 2.19901 4.12137 3.23471 3.43361 3.80402C3.39438 3.83659 3.41068 3.88879 3.44658 3.90804C3.46324 3.91692 3.48395 3.91876 3.50505 3.90951C3.51616 3.90432 3.52765 3.89842 3.53912 3.89324C4.54152 3.40685 4.53077 1.88104 3.53578 1.43907C3.4847 1.41649 3.43176 1.39797 3.37808 1.38279ZM2.19616 1.34578C1.25595 1.75814 1.15565 3.00818 1.85451 3.50012C1.91226 3.53714 1.98036 3.46977 1.94335 3.41165C1.57874 2.84382 1.63649 1.94544 2.26873 1.45016C2.32758 1.40426 2.26427 1.3158 2.19616 1.34578Z";
    const customShape = new Path2D(logoPathData);
    
    // --- CONFIG ---
    let MODAL_HEIGHT_FRACTION = 0.8;
    const WIDTH_RATIO = 1710 / 2372;
    const BASE_SIZE_REF_HEIGHT = 820;
    const BASE_SIZE_REF_VALUE = 3.4;
    const DISP_PARTICLE_ANGLE_BINS = 60;
    const DISP_MAX_EXTRA_MARGIN = 40;
    const DISP_INNER_BOOST_MAX = 0.3;
    const DISP_MAX_DELAY = 1200;
    const DISP_DEFAULT_DURATION = 1400;
    const MIN_TRAVEL_FACTOR = 0.05;
    const MIN_DURATION_FACTOR = 0.00005;
  
    let scrollAnimation = {
      enabled: true,
      scrollArea: null,
      currentProgress: 0,
      lastProgress: 0,
      rafId: null,
      throttle: false
    };
  
    // --- MOUSE INTERACTION ---
    const mouse = { x: null, y: null, radius: 55, force: 6 };
  
    // --- NATURAL MOVEMENT ---
    let naturalMovement = { enabled: true, intensity: 0 };
  
    // --- DISPERSION ---
    let dispersion = {
      active: false,
      startTime: null,
      duration: 2000,
      easePower: 3,
      maxDistance: 1500,
      _anyMoving: false
    };
  
    // Modal geometry (computed)
    let modal = { left: 0, top: 0, width: 0, height: 0 };
  
    canvas.addEventListener('mousemove', function (event) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  
    function computeViewportSize() {
      return { w: Math.max(1, window.innerWidth), h: Math.max(1, window.innerHeight) };
    }
  
    function computeModal() {
      const targetEl = document.querySelector('.hero_modal-image.is-4');
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        modal.width = rect.width;
        modal.height = rect.height;
        modal.left = rect.left;
        modal.top = rect.top;
      } else {
        const vp = computeViewportSize();
        let modalH = Math.round(vp.h * MODAL_HEIGHT_FRACTION);
        let modalW = Math.round(modalH * WIDTH_RATIO);
        if (modalW > vp.w * 0.98) {
          modalW = Math.round(vp.w * 0.98);
          modalH = Math.round(modalW / WIDTH_RATIO);
        }
        modal.width = modalW;
        modal.height = modalH;
        modal.left = Math.round((vp.w - modalW) / 2);
        modal.top = Math.round((vp.h - modalH) / 2);
      }
    }
  
    function getBaseSize() {
      return (modal.height / BASE_SIZE_REF_HEIGHT) * BASE_SIZE_REF_VALUE;
    }
  
    const styleMap = {
      '00': s => ({ fill: true, stroke: false, color: 'white', radius: s * 1.2 }),
      '01': s => ({ isShape: true, color: '#FFFDFA', scale: s * 0.6, fill: true }),
      '02': s => ({ fill: true, stroke: false, color: 'rgba(255, 255, 255, 0.2)', radius: s }),
      '03': s => ({ fill: false, stroke: true, color: 'white', radius: s, strokeWidth: 1 }),
      '04': s => ({ fill: false, stroke: true, color: 'white', radius: s * 0.5, strokeWidth: s * 0.09 }),
    };
  
    let cachedParticles = null;
    let particles = [];
    let isModelLoaded = false;
  
    function applyCanvasSize() {
      if (!isModelLoaded) return;
      const vp = computeViewportSize();
      canvas.width = Math.max(1, Math.round(vp.w * DPR));
      canvas.height = Math.max(1, Math.round(vp.h * DPR));
      canvas.style.width = vp.w + 'px';
      canvas.style.height = vp.h + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      computeModal();
      cachedParticles = null;
      initializeParticles();
    }
  
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  
    function pickGrowFactor() {
      const probs = [
        { v: 1.0, p: 0.60 },
        { v: 1.5, p: 0.20 },
        { v: 2.0, p: 0.12 },
        { v: 3.0, p: 0.06 },
        { v: 4.0, p: 0.02 }
      ];
      const r = Math.random();
      let s = 0;
      for (const item of probs) {
        s += item.p;
        if (r <= s) return item.v;
      }
      return 1.0;
    }
  
    class Particle {
      constructor(baseX, baseY, key) {
        this.baseX = baseX;
        this.baseY = baseY;
        this.originalBaseX = baseX;
        this.originalBaseY = baseY;
        this.x = baseX;
        this.y = baseY;
        this.key = key;
        this.density = (Math.random() * 30) + 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.angleX = Math.random() * Math.PI * 2;
        this.angleY = Math.random() * Math.PI * 2;
        this.speedX = 0.02 + Math.random() * 0.03;
        this.speedY = 0.02 + Math.random() * 0.03;
        this.baseRadiusX = 1 + Math.random() * 2;
        this.baseRadiusY = 1 + Math.random() * 2;
        this.updateDispersionDirection();
        this.dispersionDistance = 0;
        this.dirx = this.dispersionDirX;
        this.diry = this.dispersionDirY;
        this.travel = 0;
        this.delay = 0;
        this.startTimeLocal = null;
        this.endTimeLocal = null;
        this.moving = false;
        this.growFactor = pickGrowFactor();
        this._lastEased = 0;
        this.scrollStartProgress = 0;
        this.scrollEndProgress = 1;
        this.localScrollProgress = 0;
      }
  
      updateDispersionDirection() {
        const centerX = modal.left + modal.width / 2;
        const centerY = modal.top + modal.height / 2;
        const dx = this.baseX - centerX;
        const dy = this.baseY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        this.dispersionDirX = dx / distance;
        this.dispersionDirY = dy / distance;
      }
  
      updateWithScroll(globalScrollProgress) {
        if (globalScrollProgress <= this.scrollStartProgress) {
          this.localScrollProgress = 0;
          this._lastEased = 0;
          this.moving = false;
          this.baseX = this.originalBaseX;
          this.baseY = this.originalBaseY;
        } else if (globalScrollProgress >= this.scrollEndProgress) {
          this.localScrollProgress = 1;
          this._lastEased = 1;
          this.moving = false;
          this.baseX = this.originalBaseX + this.dirx * this.travel;
          this.baseY = this.originalBaseY + this.diry * this.travel;
        } else {
          const range = this.scrollEndProgress - this.scrollStartProgress;
          this.localScrollProgress = (globalScrollProgress - this.scrollStartProgress) / range;
          this._lastEased = easeOutCubic(this.localScrollProgress);
          this.moving = true;
          this.baseX = this.originalBaseX + this.dirx * this.travel * this._lastEased;
          this.baseY = this.originalBaseY + this.diry * this.travel * this._lastEased;
        }
      }
  
      update() {
        this.dispersionDistance = 0;
        if (naturalMovement.enabled) {
          this.angleX += this.speedX;
          this.angleY += this.speedY;
          this.offsetX = Math.sin(this.angleX) * this.baseRadiusX * naturalMovement.intensity;
          this.offsetY = Math.cos(this.angleY) * this.baseRadiusY * naturalMovement.intensity;
        } else {
          this.offsetX = 0;
          this.offsetY = 0;
        }
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density * mouse.force;
            let directionY = forceDirectionY * force * this.density * mouse.force;
            this.x -= directionX;
            this.y -= directionY;
          } else {
            const targetX = this.baseX + this.offsetX;
            const targetY = this.baseY + this.offsetY;
            if (Math.abs(this.x - targetX) > 0.1) this.x -= (this.x - targetX) / 10; else this.x = targetX;
            if (Math.abs(this.y - targetY) > 0.1) this.y -= (this.y - targetY) / 10; else this.y = targetY;
          }
        } else {
          const targetX = this.baseX + this.offsetX;
          const targetY = this.baseY + this.offsetY;
          if (Math.abs(this.x - targetX) > 0.1) this.x -= (this.x - targetX) / 10; else this.x = targetX;
          if (Math.abs(this.y - targetY) > 0.1) this.y -= (this.y - targetY) / 10; else this.y = targetY;
        }
      }
  
      draw(baseSize) {
        const styleFn = this.key && styleMap[this.key];
        const s = styleFn ? styleFn(baseSize) : { fill: true, color: '#fff', radius: baseSize };
        let color = s.color;
        if (mouse.x !== null && mouse.y !== null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            let intensity = 1 - (distance / mouse.radius);
            color = `rgba(255, 255, 255, ${intensity})`;
          }
        }
        if (s.isShape) {
          ctx.save();
          ctx.translate(this.x, this.y);
          let currentScale = s.scale || 1;
          if (this._lastEased && this._lastEased > 0) {
            const gf = this.growFactor || 1;
            currentScale = s.scale * (1 + (gf - 1) * this._lastEased);
          }
          ctx.scale(currentScale, currentScale);
          ctx.translate(-3, -3);
          ctx.fillStyle = color;
          ctx.fill(customShape, "evenodd");
          ctx.restore();
        } else {
          let drawRadius = s.radius;
          if (this._lastEased && this._lastEased > 0) {
            const gf = this.growFactor || 1;
            drawRadius = s.radius * (1 + (gf - 1) * this._lastEased);
          }
          ctx.beginPath();
          ctx.arc(this.x, this.y, Math.max(0.1, drawRadius), 0, Math.PI * 2);
          if (s.fill) { ctx.fillStyle = color; ctx.fill(); }
          if (s.stroke) { ctx.lineWidth = (s.strokeWidth || 1); ctx.strokeStyle = color; ctx.stroke(); }
        }
      }
    }
  
    function collectParticles() {
      if (cachedParticles) return cachedParticles;
      const paths = Array.from(svg.querySelectorAll('path'));
      const particleData = [];
      const svgRect = svg.getBoundingClientRect();
      const svgClientW = svgRect.width || 1;
      const svgClientH = svgRect.height || 1;
      paths.forEach(path => {
        const id = path.id || '';
        const match = id.match(/^(\d{2})_particle$/);
        const key = match ? match[1] : null;
        let bbox = path.getBoundingClientRect();
        let centerClientX = bbox.left + bbox.width / 2;
        let centerClientY = bbox.top + bbox.height / 2;
        if ((bbox.width === 0 && bbox.height === 0) || !isFinite(centerClientX) || !isFinite(centerClientY)) {
          try {
            const bb = path.getBBox();
            const pt = svg.createSVGPoint();
            pt.x = bb.x + bb.width / 2;
            pt.y = bb.y + bb.height / 2;
            const ctm = (path.getScreenCTM && path.getScreenCTM()) || svg.getScreenCTM();
            const screenPt = pt.matrixTransform(ctm);
            centerClientX = screenPt.x;
            centerClientY = screenPt.y;
          } catch (e) {
            return;
          }
        }
        const relX = centerClientX - svgRect.left;
        const relY = centerClientY - svgRect.top;
        const normX = relX / svgClientW;
        const normY = relY / svgClientH;
        const canvasX = modal.left + (normX * modal.width);
        const canvasY = modal.top + (normY * modal.height);
        const baseSize = getBaseSize();
        if (canvasX >= -baseSize && canvasX <= (modal.left + modal.width) + baseSize &&
          canvasY >= -baseSize && canvasY <= (modal.top + modal.height) + baseSize) {
          particleData.push({ x: canvasX, y: canvasY, key });
        }
      });
      cachedParticles = particleData;
      return particleData;
    }
  
    function initializeParticles() {
      const particleData = collectParticles();
      if (particles.length === particleData.length && particles.length > 0) {
        for (let i = 0; i < particleData.length; i++) {
          const pd = particleData[i];
          const p = particles[i];
          if (scrollAnimation.currentProgress === 0) {
            p.baseX = pd.x;
            p.baseY = pd.y;
            p.originalBaseX = pd.x;
            p.originalBaseY = pd.y;
            p.x = pd.x;
            p.y = pd.y;
          }
          p.key = pd.key;
        }
      } else {
        particles = particleData.map(p => new Particle(p.x, p.y, p.key));
        if (particles.length > 0) {
          prepareDispersionParams();
        }
      }
    }
  
    function chooseRandomIndices(n, k) {
      const arr = Array.from({ length: n }, (_, i) => i);
      for (let i = 0; i < k; i++) {
        const j = i + Math.floor(Math.random() * (n - i));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.slice(0, k);
    }
  
    function computeTravelToEdgeModal(p) {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      const x0 = p.baseX;
      const y0 = p.baseY;
      const dx = p.dirx;
      const dy = p.diry;
      const tCandidates = [];
      const testEdge = (x, y) => (x >= 0 && x <= w && y >= 0 && y <= h);
      if (Math.abs(dx) > 1e-6) {
        let t = (0 - x0) / dx;
        if (t > 0 && testEdge(0, y0 + dy * t)) tCandidates.push(t);
        t = (w - x0) / dx;
        if (t > 0 && testEdge(w, y0 + dy * t)) tCandidates.push(t);
      }
      if (Math.abs(dy) > 1e-6) {
        let t = (0 - y0) / dy;
        if (t > 0 && testEdge(x0 + dx * t, 0)) tCandidates.push(t);
        t = (h - y0) / dy;
        if (t > 0 && testEdge(x0 + dx * t, h)) tCandidates.push(t);
      }
      if (tCandidates.length === 0) return 600;
      return Math.max(...tCandidates) + DISP_MAX_EXTRA_MARGIN;
    }
  
    function prepareDispersionParams() {
      const centerX = modal.left + modal.width / 2;
      const centerY = modal.top + modal.height / 2;
      const n = particles.length;
      if (!n) return;
      const PARTICLE_COUNT = n;
      const escapeRatio = 0.80;
      const escapeCount = Math.round(PARTICLE_COUNT * escapeRatio);
      const escapeIndices = new Set(chooseRandomIndices(PARTICLE_COUNT, escapeCount));
      const baseDuration = (dispersion.duration && dispersion.duration > 0) ? dispersion.duration : DISP_DEFAULT_DURATION;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        let dx = p.originalBaseX - centerX;
        let dy = p.originalBaseY - centerY;
        const d = Math.hypot(dx, dy) || 1;
        let dirx = dx / d;
        let diry = dy / d;
        const perpNoise = (Math.random() - 0.5) * 0.55;
        const perpX = -diry, perpY = dirx;
        dirx += perpX * perpNoise;
        diry += perpY * perpNoise;
        const angleJitter = (Math.random() - 0.5) * 0.2;
        const cosJ = Math.cos(angleJitter);
        const sinJ = Math.sin(angleJitter);
        const jx = dirx * cosJ - diry * sinJ;
        const jy = dirx * sinJ + diry * cosJ;
        const fLen = Math.hypot(jx, jy) || 1;
        p.dirx = jx / fLen;
        p.diry = jy / fLen;
        const maxModalRadius = Math.hypot(modal.width / 2, modal.height / 2);
        const rFactor = Math.min(1, Math.hypot(p.originalBaseX - centerX, p.originalBaseY - centerY) / (maxModalRadius || 1));
        p.layerNorm = rFactor;
        const normalizedDelay = (1 - p.layerNorm) * (DISP_MAX_DELAY / baseDuration) * Math.random();
        p.delay = normalizedDelay * 0.3;
      }
      const bins = Array.from({ length: DISP_PARTICLE_ANGLE_BINS }, () => []);
      for (const p of particles) {
        const angle = Math.atan2(p.diry, p.dirx);
        const idx = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * DISP_PARTICLE_ANGLE_BINS);
        bins[Math.min(DISP_PARTICLE_ANGLE_BINS - 1, Math.max(0, idx))].push(p);
      }
      for (const bin of bins) {
        if (!bin.length) continue;
        bin.sort((a, b) => a.layerNorm - b.layerNorm);
        const len = bin.length;
        for (let i = 0; i < len; i++) {
          const p = bin[i];
          const edgeDist = computeTravelToEdgeModal(p);
          if (escapeIndices.has(particles.indexOf(p))) {
            p.travel = edgeDist;
          } else {
            const maxAllowed = Math.max(20, edgeDist - DISP_MAX_EXTRA_MARGIN * 1.5);
            const fractionBase = 0.15 + 0.75 * (i / len);
            const randOffset = (Math.random() - 0.5) * 0.1;
            let fraction = Math.min(1, Math.max(0, fractionBase + randOffset));
            p.travel = maxAllowed * fraction;
            const innerBoost = 1 + (1 - p.layerNorm) * DISP_INNER_BOOST_MAX;
            p.travel *= innerBoost;
            if (p.travel > maxAllowed) p.travel = maxAllowed;
          }
          p.travel += (Math.random() - 0.5) * 6;
          p.travel *= Math.max(MIN_TRAVEL_FACTOR, p.layerNorm);
          p.travel *= 9;
          const durationFactor = Math.max(MIN_DURATION_FACTOR, 1.0 - 0.75 * p.layerNorm);
          const scrollDuration = durationFactor * 0.7;
          p.scrollStartProgress = p.delay;
          p.scrollEndProgress = Math.min(1, p.delay + scrollDuration);
        }
      }
    }
  
    function setupAnimationControl() {
      const triggerEl = document.querySelector('.hero_modal-top');
      if (!triggerEl) {
        console.warn('Trigger element .hero_modal-top not found');
      } else {
        scrollAnimation.scrollArea = triggerEl;
        function handleScroll() {
          if (scrollAnimation.throttle) return;
          scrollAnimation.throttle = true;
          requestAnimationFrame(() => {
            const rect = triggerEl.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const startOffsetFactor = -8.5;
            const endOffsetFactor = -10.0;
            const startThreshold = viewportHeight * startOffsetFactor;
            const endThreshold = viewportHeight * endOffsetFactor;
            let progress = (rect.top - startThreshold) / (endThreshold - startThreshold);
            progress = Math.max(0, Math.min(1, progress));
            scrollAnimation.currentProgress = progress;
            dispersion.active = progress > 0;
            particles.forEach(p => p.updateWithScroll(progress));
            dispersion._anyMoving = particles.some(p => p.moving);
            scrollAnimation.throttle = false;
          });
        }
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
      }
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const baseSize = getBaseSize();
        particles.forEach(p => p.updateDispersionDirection());
        particles.forEach(particle => {
          particle.update();
          particle.draw(baseSize);
        });
        requestAnimationFrame(animate);
      }
      animate();
    }
  
    const observer = new MutationObserver(() => {
      if (isModelLoaded) {
        cachedParticles = null;
        initializeParticles();
      }
    });
    observer.observe(svg, { attributes: true, childList: true, subtree: true });
  
    window.addEventListener('resize', () => {
      if (isModelLoaded) {
        cachedParticles = null;
        applyCanvasSize();
        if (particles.length > 0) {
          prepareDispersionParams();
        }
      }
    });
  
    function startModel() {
      if (isModelLoaded) return;
      isModelLoaded = true;
      applyCanvasSize();
      setupAnimationControl();
    }
  
    function checkLoadTrigger() {
      if (isModelLoaded) return;
      const triggerEl = document.querySelector('.hero_modal-scroll');
      if (!triggerEl) {
        startModel();
        return;
      }
      const rect = triggerEl.getBoundingClientRect();
      if (rect.top <= 0) {
        startModel();
        window.removeEventListener('scroll', checkLoadTrigger);
      }
    }
  
    window.addEventListener('scroll', checkLoadTrigger, { passive: true });
    checkLoadTrigger();
  
    window.SVG_PARTICLE_CANVAS = {
      setModalHeightFraction(frac) {
        MODAL_HEIGHT_FRACTION = Math.min(Math.max(frac, 0.05), 0.98);
        if (isModelLoaded) applyCanvasSize();
      },
      setMouseRadius(radius) { mouse.radius = radius; },
      setMouseForce(force) { mouse.force = force; },
      setNaturalMovement(enabled) { naturalMovement.enabled = enabled; },
      setNaturalMovementIntensity(intensity) { naturalMovement.intensity = intensity; },
      triggerDispersion() {
        if (isModelLoaded) prepareDispersionParams();
      },
      setDispersionDuration(ms) { dispersion.duration = ms; },
      setDispersionEasePower(power) { dispersion.easePower = power; },
      setDispersionMaxDistance(distance) { dispersion.maxDistance = distance; },
      isDispersing() { return dispersion._anyMoving; },
      getScrollProgress() { return scrollAnimation.currentProgress; },
      redraw() {
        if (!isModelLoaded) return;
        cachedParticles = null;
        initializeParticles();
        prepareDispersionParams();
      },
      isLoaded() { return isModelLoaded; },
      config() {
        return {
          isLoaded: isModelLoaded,
          viewportWidth: computeViewportSize().w,
          viewportHeight: computeViewportSize().h,
          modalLeft: modal.left,
          modalTop: modal.top,
          modalWidth: modal.width,
          modalHeight: modal.height,
          modalHeightFraction: MODAL_HEIGHT_FRACTION,
          baseSize: getBaseSize(),
          mouseRadius: mouse.radius,
          mouseForce: mouse.force,
          naturalMovement: naturalMovement.enabled,
          naturalMovementIntensity: naturalMovement.intensity,
          dispersionDuration: dispersion.duration,
          dispersionEasePower: dispersion.easePower,
          dispersionMaxDistance: dispersion.maxDistance,
          dispersionAnyMoving: dispersion._anyMoving,
          scrollProgress: scrollAnimation.currentProgress
        };
      }
    };
  })();