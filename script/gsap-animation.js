// hero-animations.js

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, InertiaPlugin, CustomEase, ScrambleTextPlugin);
  
    // 1. Initial Title Split
    const h1 = document.querySelector('.hero-title');
    if (h1) {
      const split = new SplitText(h1, { type: 'words,chars' });
      gsap.from(split.chars, {
        opacity: 0.1,
        duration: 0.4,
        ease: 'power3.out',
        stagger: 0.03
      });
    }
  
    // 2. Main Scroll Timeline
    // Accessing the global scrollMap defined in config.js
    const scrollMap = window.scrollMap; 
  
    // --- HERO ANIMATIONS ---
    // Main Header Title
    gsap.to(".hero_modal-header h1", {
      y: "50vh",
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero_modal-header",
        start: "top top",
        end: "bottom top",
        scrub: 2,
        fastScrollEnd: true
      }
    });
  
    // Shadow Movement
    gsap.to(".hero_modal-shadow", {
      y: "20vh",
      opacity: 0.1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[0].start,
        end: scrollMap.scrollTriggers[0].end,
        scrub: 2,
        fastScrollEnd: true
      }
    });
  
    // Image Mask Reveal (Image 1)
    gsap.fromTo(".hero_modal-image.is-1", {
      maskImage: "linear-gradient(180deg, black, black 100%, transparent 115%)"
    }, {
      maskImage: "linear-gradient(180deg, black, black -15%, transparent 0%)",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[1].start,
        end: scrollMap.scrollTriggers[1].end,
        scrub: 2,
        fastScrollEnd: true
      }
    });
  
    // Image Mask Reveal (Image 2)
    gsap.fromTo(".hero_modal-image.is-2", {
      maskImage: "linear-gradient(180deg, black, black 100%, transparent 115%)"
    }, {
      maskImage: "linear-gradient(180deg, black, black -15%, transparent 0%)",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[2].start,
        end: scrollMap.scrollTriggers[2].end,
        scrub: 2,
        fastScrollEnd: true
      }
    });
  
    // Vertical Text Movement (Block 1)
    gsap.fromTo(".hero_modal-text", {
      y: "60vh"
    }, {
      y: "-65vh",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[3].start,
        end: scrollMap.scrollTriggers[3].end,
        scrub: 2,
        fastScrollEnd: true
      }
    });
  
    // SplitText Animation (Second Text)
    const h2 = document.querySelector("#second-text");
    if (h2) {
      const split = new SplitText(h2, { type: "words,chars" });
      gsap.from(split.chars, {
        opacity: 0.1,
        duration: 0.8,
        ease: "none",
        stagger: 0.03,
        scrollTrigger: {
          trigger: ".hero_modal-top",
          start: scrollMap.scrollTriggers[3].start,
          end: scrollMap.scrollTriggers[3].end,
          scrub: 2,
          fastScrollEnd: true,
          onUpdate(self) {
            const capped = Math.min(self.progress * 1.3333, 1);
            if (self.animation) self.animation.progress(capped);
          }
        }
      });
    }
  
    // Image Label Entrance
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[4].start,
        end: scrollMap.scrollTriggers[4].end,
        scrub: 2,
        fastScrollEnd: true
      }
    })
    .from("[image-label] .hero_model-svg", {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.1,
      ease: "power1.out"
    })
    .from("[image-label] .hero_model-lable", {
      autoAlpha: 0,
      duration: 0.1,
      ease: "power2.out"
    });
  
    // Image Label Exit
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[5].start,
        end: scrollMap.scrollTriggers[5].end,
        scrub: 2,
        fastScrollEnd: true
      }
    })
    .to("[image-label]", {
      opacity: 0,
      duration: 0.2,
      delay: 0.8,
      ease: "power1.out"
    });
  
    // Image 3 Exit
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[6].start,
        end: scrollMap.scrollTriggers[6].end,
        scrub: 2,
        fastScrollEnd: true
      }
    })
    .to(".hero_modal-image.is-3", {
      opacity: 0,
      duration: 1,
      ease: "power1.out"
    });
  
    // Image 4 Reveal & Canvas Un-blur
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[7].start,
        end: scrollMap.scrollTriggers[7].end,
        scrub: 2,
        fastScrollEnd: true
      }
    })
    .fromTo(".hero_modal-image.is-4-wrapper", {
      maskImage: "linear-gradient(180deg, black, black 100%, transparent 115%)"
    }, {
      maskImage: "linear-gradient(180deg, black, black -15%, transparent 0%)",
      duration: 1,
      ease: "none"
    })
    .to(".hero_canvas", {
      filter: "blur(0px)",
      duration: 1,
      ease: "none"
    }, 0);
  
    // Vertical Text Movement (Block 2)
    gsap.fromTo(".hero_modal-text-2", {
      y: "65vh"
    }, {
      y: "-65vh",
      ease: "none",
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[8].start,
        end: scrollMap.scrollTriggers[8].end,
        scrub: 2,
        fastScrollEnd: true
      }
    });
  
    // SplitText Animation (Third Text)
    const thirdTextEl = document.querySelector("#third-text");
    if (thirdTextEl) {
      const textSplit = new SplitText(thirdTextEl, { type: "words,chars" });
      gsap.from(textSplit.chars, {
        opacity: 0.1,
        duration: 0.8,
        ease: "none",
        stagger: 0.03,
        scrollTrigger: {
          trigger: ".hero_modal-top",
          start: scrollMap.scrollTriggers[8].start,
          end: scrollMap.scrollTriggers[8].end,
          scrub: 2,
          fastScrollEnd: true,
          onUpdate(self) {
            const capped = Math.min(self.progress * 1.3333, 1);
            if (self.animation) self.animation.progress(capped);
          }
        }
      });
    }
  
    // Particle Label Entrance
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[9].start,
        end: scrollMap.scrollTriggers[9].end,
        scrub: 2,
        fastScrollEnd: true
      }
    })
    .from("[particle-label] .hero_model-svg", {
      clipPath: "inset(0 100% 0 0)",
      duration: 0.1,
      ease: "power1.out"
    })
    .from("[particle-label] .hero_model-lable", {
      autoAlpha: 0,
      duration: 0.1,
      ease: "power2.out"
    });

    // Particle Label Exit
    gsap.timeline({
      scrollTrigger: {
        trigger: ".hero_modal-top",
        start: scrollMap.scrollTriggers[10].start,
        end: scrollMap.scrollTriggers[10].end,
        scrub: 2,
        fastScrollEnd: true,
        onLeave: () => {
          gsap.set(".moude_interaction-layer", { display: "none" });
        },
        onEnterBack: () => {
          gsap.set(".moude_interaction-layer", { display: "block" });
        }
      }
    })
    .to("[particle-label]", {
      opacity: 0,
      duration: 0.2,
      delay: 0.8,
      ease: "power1.out"
    });
  
    // --- TRANSITION PHASES ---
    const mm = gsap.matchMedia();
    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      let { isMobile } = context.conditions;
      const moveAxis = isMobile ? "x" : "y";
      
      // Phase 1
      const tlPhase1 = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero_modal-header",
          start: scrollMap.scrollTriggers[3].start,
          toggleActions: "play none none reverse"
        }
      });
      tlPhase1
        .fromTo("#transition-1", { [moveAxis]: "0%" }, { [moveAxis]: "100%", ease: "power2.in" })
        .fromTo("#transition-text-1", { opacity: 1 }, { opacity: 0.2, ease: "power2.in" }, "<")
        .fromTo("#transition-2", { [moveAxis]: "-100%" }, { [moveAxis]: "0%", ease: "power2.out" }, "<")
        .fromTo("#transition-text-2", { opacity: 0.2 }, { opacity: 1, ease: "power2.in" }, "<");
  
      // Phase 2
      const tlPhase2 = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero_modal-header",
          start: scrollMap.scrollTriggers[9].start,
          toggleActions: "play none none reverse"
        }
      });
      tlPhase2
        .fromTo("#transition-2", { [moveAxis]: "0%" }, { [moveAxis]: "100%", ease: "power2.in", immediateRender: false })
        .fromTo("#transition-text-2", { opacity: 1 }, { opacity: 0.2, ease: "power2.in", immediateRender: false }, "<")
        .fromTo("#transition-3", { [moveAxis]: "-100%" }, { [moveAxis]: "0%", ease: "power2.out" }, "<")
        .fromTo("#transition-text-3", { opacity: 0.2 }, { opacity: 1, ease: "power2.in" }, "<")
        .to(".hero_transition-text", { color: "#fff" }, "<");
    });
  });
