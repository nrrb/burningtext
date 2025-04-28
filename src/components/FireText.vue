<template>
  <div class="fire-container">
    <canvas ref="fireCanvas"></canvas>
  </div>
</template>

<script>
import { createNoise2D } from 'simplex-noise';

export default {
  name: 'FireText',

  props: {
    text: {
      type: String,
      default: 'LOVE'
    },
    fontSize: {
      type: Number,
      default: 72
    },
    fontFamily: {
      type: String,
      default: 'Arial, sans-serif'
    },
    intensity: {
      type: Number,
      default: 255
    },
    cooling: {
      type: Number,
      default: 3
    },
    spreadRate: {
      type: Number,
      default: 3
    }
  },

  data() {
    return {
      width: 0,
      height: 0,
      pixelSize: 10,
      fireBuffer: null,
      ctx: null,
      animationId: null,
      textEdgePixels: [],
      palette: [],
      noise2D: createNoise2D(),
      frame: 0
    }
  },

  mounted() {
    this.initCanvas();
    this.createFirePalette();
    this.initFire();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  },

  beforeUnmount() {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.handleResize);
  },

  methods: {
    initCanvas() {
      const canvas = this.$refs.fireCanvas;
      this.width = Math.ceil(window.innerWidth / this.pixelSize);
      this.height = Math.ceil(window.innerHeight / this.pixelSize);
      canvas.width = this.width * this.pixelSize;
      canvas.height = this.height * this.pixelSize;
      this.ctx = canvas.getContext('2d');
      this.initFire();
      window.addEventListener('resize', this.handleResize);
    },

    handleResize() {
      this.width = Math.ceil(window.innerWidth / this.pixelSize);
      this.height = Math.ceil(window.innerHeight / this.pixelSize);
      this.$refs.fireCanvas.width = this.width * this.pixelSize;
      this.$refs.fireCanvas.height = this.height * this.pixelSize;
      this.initFire();
    },

    initFire() {
      // Create a new buffer for the fire effect
      this.fireBuffer = new Uint8Array(this.width * this.height);

      // Get the edge pixels of the text to use as fire sources
      this.textEdgePixels = this.createFireSourceFromText(
        this.text,
        this.width / 2,
        this.height / 2
      );
    },

    getLinePixels(x1, y1, x2, y2) {
      // Bresenham's line algorithm to get pixels along a line
      const pixels = [];

      let dx = Math.abs(x2 - x1);
      let dy = Math.abs(y2 - y1);
      let sx = x1 < x2 ? 1 : -1;
      let sy = y1 < y2 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        pixels.push({ x: x1, y: y1 });

        if (x1 === x2 && y1 === y2) break;

        let e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x1 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y1 += sy;
        }
      }

      return pixels;
    },

    createFireSourceFromText(text, centerX, centerY) {
      // Create a temporary canvas to render text
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      // Set font and measure text
      tempCtx.font = `${this.fontSize}px ${this.fontFamily}`;
      const metrics = tempCtx.measureText(text);

      // Calculate text width and height
      const textWidth = metrics.width;
      const textHeight = this.fontSize * 1.2; // Approximate height

      // Set canvas size
      tempCanvas.width = textWidth + 20;
      tempCanvas.height = textHeight + 20;

      // Position text in the center of the temporary canvas
      const textX = 10;
      const textY = textHeight;

      // Clear canvas and render text
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.font = `${this.fontSize}px ${this.fontFamily}`;
      tempCtx.fillStyle = 'white';
      tempCtx.fillText(text, textX, textY);

      // Get image data
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      // Calculate position in main canvas
      const offsetX = centerX - textWidth / 2;
      const offsetY = centerY - textHeight / 2;

      // Find edge pixels
      const edgePixels = [];

      for (let py = 0; py < tempCanvas.height; py++) {
        for (let px = 0; px < tempCanvas.width; px++) {
          const idx = (py * tempCanvas.width + px) * 4;

          // If this pixel is part of the text (not transparent)
          if (data[idx + 3] > 100) {
            // Check if any neighboring pixel is transparent (edge detection)
            const neighbors = [
              { x: px - 1, y: py },     // left
              { x: px + 1, y: py },     // right
              { x: px, y: py - 1 },     // top
              { x: px, y: py + 1 },     // bottom
              { x: px - 1, y: py - 1 }, // top-left
              { x: px + 1, y: py - 1 }, // top-right
              { x: px - 1, y: py + 1 }, // bottom-left
              { x: px + 1, y: py + 1 }  // bottom-right
            ];

            const isEdge = neighbors.some(n => {
              if (n.x < 0 || n.x >= tempCanvas.width || n.y < 0 || n.y >= tempCanvas.height) {
                return true; // Consider canvas boundaries as edges
              }

              const nIdx = (n.y * tempCanvas.width + n.x) * 4;
              return data[nIdx + 3] <= 100; // Neighbor is transparent or semi-transparent
            });

            if (isEdge) {
              // Convert to main canvas coordinates
              const mainX = Math.floor(px + offsetX);
              const mainY = Math.floor(py + offsetY);

              if (mainX >= 0 && mainX < this.width && mainY >= 0 && mainY < this.height) {
                edgePixels.push({ x: mainX, y: mainY });

                // Seed this pixel in the fire buffer
                this.fireBuffer[mainY * this.width + mainX] = this.intensity;
              }
            }
          }
        }
      }

      return edgePixels;
    },

    updateFire() {
      // Create a new buffer
      const newBuffer = new Uint8Array(this.width * this.height);

      // Update fire pixels based on surrounding pixels
      for (let y = 0; y < this.height - 1; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = y * this.width + x;

          // Calculate average of pixels below
          let sum = 0;
          let count = 0;

          // Below (y+1)
          if (y + 1 < this.height) {
            sum += this.fireBuffer[(y + 1) * this.width + x];
            count++;
          }

          // Below left (x-1, y+1)
          if (x > 0 && y + 1 < this.height) {
            sum += this.fireBuffer[(y + 1) * this.width + (x - 1)];
            count++;
          }

          // Below right (x+1, y+1)
          if (x + 1 < this.width && y + 1 < this.height) {
            sum += this.fireBuffer[(y + 1) * this.width + (x + 1)];
            count++;
          }

          // Two rows below (y+2)
          if (y + 2 < this.height) {
            sum += this.fireBuffer[(y + 2) * this.width + x];
            count++;
          }

          // Calculate new value with decay
          if (count > 0) {
            const avgHeat = Math.floor(sum / count);
            const cooling = Math.floor(Math.random() * this.cooling);
            newBuffer[idx] = Math.max(0, avgHeat - cooling);
          }
        }
      }

      // Preserve fire sources
      for (let x = 0; x < this.width; x++) {
        const sourceIdx = (this.height - 1) * this.width + x;
        if (this.fireBuffer[sourceIdx] === 255) {
          newBuffer[sourceIdx] = 255;
        }
      }

      // Update the fire buffer with new values
      this.fireBuffer = newBuffer;
    },

    createFirePalette() {
      this.palette = new Array(256);

      // Create fire palette from black to yellow/white
      for (let i = 0; i < 256; i++) {
        // Black for lowest values (transparent)
        if (i < 20) {
          this.palette[i] = [0, 0, 0, 0];
        }
        // Deep red to bright red
        else if (i < 100) {
          const v = Math.floor((i - 20) * (255 / 80));
          this.palette[i] = [v, 0, 0, v * 2];
        }
        // Red to orange to yellow
        else if (i < 220) {
          const v = Math.floor((i - 100) * (255 / 120));
          this.palette[i] = [255, v, 0, 255];
        }
        // Yellow to white
        else {
          const v = Math.floor((i - 220) * (255 / 35));
          this.palette[i] = [255, 255, v, 255];
        }
      }
    },

    renderFire() {
      // Clear the canvas
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.width * this.pixelSize, this.height * this.pixelSize);

      // Draw fire effect
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = y * this.width + x;
          const color = this.palette[this.fireBuffer[idx]];
          if (color[3] > 0) { // Only draw if not fully transparent
            this.ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]/255})`;
            this.ctx.fillRect(
              x * this.pixelSize,
              y * this.pixelSize,
              this.pixelSize,
              this.pixelSize
            );
          }
        }
      }
    },

    renderText() {
      // Draw text directly using the fire source positions
      this.ctx.fillStyle = 'black';

      // Draw a white block for each fire source pixel
      this.textEdgePixels.forEach(({ x, y }) => {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          this.ctx.fillRect(
            x * this.pixelSize,
            y * this.pixelSize,
            this.pixelSize,
            this.pixelSize
          );
        }
      });
    },

    animate() {
      // Re-seed the fire source pixels with Perlin noise
      this.textEdgePixels.forEach(({ x, y }) => {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
          // Scale coordinates and time for smoother noise
          const nx = x * 0.1;
          const ny = y * 0.1;
          const nt = this.frame * 0.02;

          // Generate noise value between -1 and 1
          const noiseValue = this.noise2D(nx + nt, ny);

          // Convert to fire intensity (0-255)
          const fireIntensity = Math.floor(
            this.intensity * (0.8 + 0.2 * noiseValue)
          );

          this.fireBuffer[y * this.width + x] = Math.max(0, Math.min(255, fireIntensity));
        }
      });

      // Update frame counter
      this.frame++;

      // Update and render fire
      this.updateFire();
      this.renderFire();

      // Render text on top
      this.renderText();

      // Draw tagline text in top left
      const taglineText = 'A new kind of bold.';
      const emoji = '🔥';
      const taglineFontSize = this.fontSize * this.pixelSize / 4;
      const margin = this.pixelSize * 2;

      // Draw text directly on main canvas
      this.ctx.font = `bold ${taglineFontSize}px ${this.fontFamily}`;
      this.ctx.textBaseline = 'top';

      // Draw white text
      this.ctx.fillStyle = 'white';
      this.ctx.fillText(taglineText, margin, margin);

      // Draw emoji in original color
      const textWidth = this.ctx.measureText(taglineText + ' ').width;
      this.ctx.fillStyle = '#000'; // Reset to black to get original emoji color
      this.ctx.fillText(emoji, margin + textWidth, margin);

      // Continue animation
      this.animationId = requestAnimationFrame(this.animate);
    }
  }
}
</script>

<style scoped>
.fire-container {
  width: 100%;
  height: 100%;
  background-color: #000;
  overflow: hidden;
}
</style>