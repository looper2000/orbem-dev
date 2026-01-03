// config.js
// Defines the scroll offsets used by GSAP and the 3D model

const baseStart = "top top";
const offsets = [
  { part: "shadow", offset: 10 },
  { part: "1st 3d reavel", offset: 110 },
  { part: "2st 3d reavel", offset: 210 },
  { part: "1st text move", offset: 310 },
  { part: "3d model Lable show", offset: 360 },
  { part: "3d model Lable hide", offset: 460 },
  { part: "Pixalation effect", offset: 500 },
  { part: "Partical reaveal", offset: 600 },
  { part: "3rd text move", offset: 700 },
  { part: "particel Lable show", offset: 750 },
  { part: "particel Lable hide", offset: 850 }
];

// We attach this to the window object so other files can access it
window.scrollMap = {
  scrollTriggers: offsets.map((item, i) => {
    const start = i === 0 ? baseStart : `top top-=${offsets[i - 1].offset}%`;
    const end = `top top-=${item.offset}%`;
    return { start, end };
  })
};