const noiseScale = 0.01;
const waterLevel = 0.3;

let sun;

let heightMap, colourMap, finalScreen;

let shadowShader;

function preload() {
  shadowShader = loadShader("/shaders/shader.vert", "/shaders/shader.frag");
}


function setup() {
  createCanvas(800, 800);
  noSmooth();
    
  // create a graphics objects for height map and colour map
  heightMap = createGraphics(width, height); 
  colourMap = createGraphics(width, height);
  finalScreen = createGraphics(width, height, WEBGL);
  
  sun = createVector(0, 0.5, 1); // sun at 1 unit high
  
  generate();
  
  finalScreen.shader(shadowShader);
}

function draw() {
  
  // Use mouse loaction as sun
  sun.x = mouseX/width;
  sun.y = mouseY/height;
  
  // Animate sun position
  // const timeSlow = 10000;
  // sun.x = cos(millis()/timeSlow) * 0.5 + 0.5;
  // sun.y = sin(millis()/timeSlow) * 0.5 + 0.5;
  // sun.z = 1.5; //cos(millis()/timeSlow * 5) * 0.6 + 1;
  
  // Set values into the shader
  shadowShader.setUniform("colour", colourMap);
  shadowShader.setUniform("height", heightMap);
  shadowShader.setUniform("sunPos", [sun.x, sun.y, sun.z]);
  
  // Draw rect on screen to get shader to run
  finalScreen.clear();
  finalScreen.rect(0, 0, width, height);
  
  // Output shader image on canvas
  image(finalScreen, 0, 0, width, height);
  // showSun();
}

function showSun() {
  fill(255, 200, 0);
  noStroke();
  circle(sun.x * width, sun.y * width, sun.z * 20);
}

function mouseReleased() {
  // Generate new island when mouse released
  noiseSeed(millis());
  generate();
}

// Island generation stuff
// not that exciting, just use perlin noise to make
// some basic island terrain

function generate() {
  // Loop through each pixel and fill the height and colour maps
  for(let i = 0; i < width; i ++) {
    for(let j = 0; j < height; j ++) {
      tile(i, j);
    }
  }
}

function tile(x, y) {
  // Get the nois value
  let n = noiseVal(x, y);
  
  // Draw it in grey scale onto the height map
  heightMap.noStroke();
  heightMap.fill(255 * n);
  heightMap.square(x, y, 1);
  
  // Figure out the colour based on height
  // and draw onto colour map
  colourMap.noStroke();
  if(n <= 0.3) {
    colourMap.fill("#62A6A9");
  } else if(n <= 0.4) {
    colourMap.fill("#D6B69E");
  } else if(n <= 0.5) {
    colourMap.fill("#98AD5A");
  } else if(n <= 0.6) {
    colourMap.fill("#658541");
  } else if(n <= 0.7) {
    colourMap.fill("#477645");
  } else if(n <= 0.8) {
    colourMap.fill("#6D7687");
  } else if(n <= 0.9) {
    colourMap.fill("#848D9A");
  } else {
    colourMap.fill("#D2E0DE");
  }
  
  colourMap.square(x, y, 1);
}

function noiseVal(x, y) {
  // Use perlin noise for basic terrain
  let n = noise(x * noiseScale, y * noiseScale);
    
  // Shape terrain to be islands in the middle
  n *= islandMod(x, y);
  // Keep the water flat
  return max(waterLevel, n);
}

// Squashes terrain further from the centre so that
// outsides are guarenteed to be water
function islandMod(x, y) {
  let maxD = min(width, height);
  maxD = (maxD/2) * (maxD/2);
  
  const dx = width/2 - x;
  const dy = height/2 - y;
  
  const dSq = (dx * dx) + (dy * dy);
  
  return map(dSq, 0, maxD, 1, 0);
}