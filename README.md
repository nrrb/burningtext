# BurningText

A Vue.js component that renders text with a dynamic fire effect using Perlin noise. The fire effect is achieved by simulating heat diffusion and using a color palette for rendering.

## Features

- Dynamic fire effect using Perlin noise
- Customizable text rendering
- Adjustable fire parameters (intensity, cooling, spread rate)
- Responsive design that scales with window size
- Pixelated rendering for retro effect

## Inspiration

This project is inspired by:
- [Demoscene Fire Effect](https://lodev.org/cgtutor/fire.html) - Original implementation of the fire effect. 
- [Doom PSX Fire Effect](https://fabiensanglard.net/doom_fire_psx/) - More inspiration from the Doom video game.
- [Fire Effect Tutorial](https://web.archive.org/web/20160418004150/http://freespace.virgin.net/hugo.elias/models/m_fire.htm) - Classic article on fire simulation

## Technical Implementation

### Perlin Noise

The fire effect uses [simplex-noise](https://www.npmjs.com/package/simplex-noise) to generate smooth, natural-looking variations in fire intensity. The noise function creates a 2D field that evolves over time, making the fire appear more dynamic and organic.

Key resources:
- [Understanding Perlin Noise](https://adrianb.io/2014/08/09/perlinnoise.html)
- [Simplex Noise Documentation](https://github.com/jwagner/simplex-noise.js)

## Usage

### Installation

```sh
npm install
npm run dev
```

### Vue Component

```vue
<template>
  <FireText
    text="LOVE"
    :font-size="72"
    font-family="Arial, sans-serif"
    :intensity="255"
    :cooling="5"
    :spread-rate="3"
  />
</template>

<script setup>
import FireText from './components/FireText.vue'
</script>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | String | 'LOVE' | Text to display with fire effect |
| fontSize | Number | 72 | Base font size in pixels |
| fontFamily | String | 'Arial, sans-serif' | Font family for text rendering |
| intensity | Number | 255 | Maximum fire intensity (0-255) |
| cooling | Number | 5 | Rate at which fire cools down |
| spreadRate | Number | 3 | Rate at which fire spreads upward |

## Development

### Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

