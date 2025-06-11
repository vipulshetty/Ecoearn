/**
 * Simple but effective Image Analysis for Waste Detection
 * Focus on what actually works: good color analysis + smart fallbacks
 */

export interface WasteDetectionResult {
  wasteType: string;
  confidence: number;
  label: string;
  detailedType: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  allDetections: Array<{
    class: string;
    wasteType: string;
    score: number;
    bbox: number[];
  }>;
}

interface ColorAnalysis {
  dominantColors: string[];
  colorDistribution: Record<string, number>;
  brightness: number;
  saturation: number;
  hue: number;
}

interface ShapeAnalysis {
  edges: number;
  corners: number;
  roundness: number;
  aspectRatio: number;
  circularity: number;
  rectangularity: number;
  edgeDensity: number;
  contourCount: number;
}

interface TextureAnalysis {
  smoothness: number;
  roughness: number;
  patterns: number;
  uniformity: number;
  entropy: number;
}

/**
 * Analyze image using improved color analysis and smart fallbacks
 */
export async function analyzeWasteImage(imageFile: File): Promise<WasteDetectionResult> {
  console.log('🔍 Starting improved image analysis for:', imageFile.name);

  try {
    // Create image URL for analysis
    const imageUrl = URL.createObjectURL(imageFile);

    // Run improved color analysis + filename hints
    const [colorResult, filenameResult] = await Promise.all([
      analyzeImageColorsAdvanced(imageUrl),
      analyzeFilename(imageFile.name)
    ]);

    console.log('� Analysis results:', {
      color: colorResult,
      filename: filenameResult
    });

    // Combine results intelligently
    const finalResult = combineResults(colorResult, filenameResult, imageFile);

    // Clean up object URL
    URL.revokeObjectURL(imageUrl);

    console.log('✅ Final result:', finalResult);
    return finalResult;

  } catch (error) {
    console.error('❌ Image analysis failed:', error);
    return getFallbackResult(imageFile.name);
  }
}

/**
 * Advanced color analysis using HSV color space and improved preprocessing
 */
async function analyzeImageColorsAdvanced(imageUrl: string): Promise<Partial<WasteDetectionResult>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ confidence: 0 });
          return;
        }

        // Better image preprocessing - maintain aspect ratio and use higher resolution
        const maxSize = 512; // Increased resolution for better analysis
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = Math.floor(img.width * ratio);
        canvas.height = Math.floor(img.height * ratio);

        // Apply histogram equalization for better contrast
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply histogram equalization
        const equalizedData = applyHistogramEqualization(data);

        // Advanced color analysis using HSV color space
        const colorAnalysis = analyzeColorDistributionAdvanced(equalizedData);
        const wasteType = determineWasteTypeFromAdvancedColors(colorAnalysis);

        resolve({
          wasteType: wasteType.type,
          confidence: wasteType.confidence,
          label: wasteType.label,
          quality: wasteType.confidence > 0.85 ? 'excellent' :
                   wasteType.confidence > 0.7 ? 'good' :
                   wasteType.confidence > 0.5 ? 'fair' : 'poor'
        });

      } catch (error) {
        console.error('Advanced color analysis error:', error);
        resolve({ confidence: 0 });
      }
    };

    img.onerror = () => resolve({ confidence: 0 });
    img.src = imageUrl;
  });
}

/**
 * Apply histogram equalization to improve image contrast
 */
function applyHistogramEqualization(data: Uint8ClampedArray): Uint8ClampedArray {
  const histogram = new Array(256).fill(0);
  const equalizedData = new Uint8ClampedArray(data.length);

  // Calculate histogram for luminance
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    histogram[luminance]++;
  }

  // Calculate cumulative distribution
  const cdf = new Array(256);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }

  // Normalize CDF
  const totalPixels = data.length / 4;
  const cdfMin = cdf.find(val => val > 0) || 0;

  // Apply equalization
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const equalizedLuminance = Math.round(((cdf[luminance] - cdfMin) / (totalPixels - cdfMin)) * 255);

    // Maintain color ratios while adjusting brightness
    const factor = equalizedLuminance / (luminance || 1);

    equalizedData[i] = Math.min(255, Math.max(0, r * factor));
    equalizedData[i + 1] = Math.min(255, Math.max(0, g * factor));
    equalizedData[i + 2] = Math.min(255, Math.max(0, b * factor));
    equalizedData[i + 3] = a;
  }

  return equalizedData;
}

/**
 * Convert RGB to HSV color space
 */
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = max === 0 ? 0 : diff / max;
  let v = max;

  if (diff !== 0) {
    switch (max) {
      case r: h = ((g - b) / diff + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / diff + 2) / 6; break;
      case b: h = ((r - g) / diff + 4) / 6; break;
    }
  }

  return [h * 360, s * 100, v * 100];
}

/**
 * Advanced color distribution analysis using HSV color space
 */
function analyzeColorDistributionAdvanced(data: Uint8ClampedArray): ColorAnalysis {
  const colorCounts = {
    red: 0, orange: 0, yellow: 0, green: 0, blue: 0, purple: 0,
    brown: 0, white: 0, black: 0, gray: 0, clear: 0, metallic: 0
  };

  let totalPixels = 0;
  let totalBrightness = 0;
  let totalSaturation = 0;
  let totalHue = 0;

  // Sample every 4th pixel for better coverage while maintaining performance
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue; // Skip transparent pixels

    const [h, s, v] = rgbToHsv(r, g, b);
    totalPixels++;
    totalBrightness += v;
    totalSaturation += s;
    totalHue += h;

    // Enhanced color classification using HSV
    if (v > 85 && s < 15) {
      colorCounts.white++;
    } else if (v < 15) {
      colorCounts.black++;
    } else if (s < 20 && v > 30 && v < 85) {
      if (v > 60) {
        colorCounts.metallic++;
      } else {
        colorCounts.gray++;
      }
    } else if (s > 20) {
      // Classify by hue for saturated colors
      if (h >= 0 && h < 15 || h >= 345) {
        colorCounts.red++;
      } else if (h >= 15 && h < 45) {
        colorCounts.orange++;
      } else if (h >= 45 && h < 75) {
        colorCounts.yellow++;
      } else if (h >= 75 && h < 165) {
        colorCounts.green++;
      } else if (h >= 165 && h < 255) {
        colorCounts.blue++;
      } else if (h >= 255 && h < 285) {
        colorCounts.purple++;
      } else if (h >= 285 && h < 345) {
        if (v < 50) {
          colorCounts.brown++;
        } else {
          colorCounts.red++;
        }
      }
    } else {
      // Low saturation, classify by brightness and context
      if (v > 70) {
        colorCounts.clear++;
      } else {
        colorCounts.brown++;
      }
    }
  }

  // Convert to percentages and calculate averages
  const colorDistribution: Record<string, number> = {};
  for (const [color, count] of Object.entries(colorCounts)) {
    colorDistribution[color] = totalPixels > 0 ? count / totalPixels : 0;
  }

  const dominantColors = Object.entries(colorDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([color]) => color);

  return {
    dominantColors,
    colorDistribution,
    brightness: totalPixels > 0 ? totalBrightness / totalPixels : 0,
    saturation: totalPixels > 0 ? totalSaturation / totalPixels : 0,
    hue: totalPixels > 0 ? totalHue / totalPixels : 0
  };
}

/**
 * Analyze color distribution in image data
 */
function analyzeColorDistribution(data: Uint8ClampedArray) {
  const colors = {
    red: 0, green: 0, blue: 0, yellow: 0, orange: 0,
    brown: 0, white: 0, black: 0, gray: 0, clear: 0, metallic: 0
  };
  
  let totalPixels = 0;
  
  // Sample every 8th pixel for performance
  for (let i = 0; i < data.length; i += 32) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    if (a < 128) continue; // Skip transparent pixels
    
    totalPixels++;
    
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    
    // Enhanced color classification
    if (brightness > 220 && saturation < 30) {
      colors.white++;
    } else if (brightness < 40) {
      colors.black++;
    } else if (saturation < 25 && brightness > 80 && brightness < 180) {
      if (brightness > 140) {
        colors.metallic++;
      } else {
        colors.gray++;
      }
    } else if (r > g + 25 && r > b + 25) {
      if (r > 180 && g > 80 && b < 80) {
        colors.orange++;
      } else {
        colors.red++;
      }
    } else if (g > r + 15 && g > b + 15) {
      colors.green++;
    } else if (b > r + 15 && b > g + 15) {
      if (brightness > 150 && saturation < 50) {
        colors.clear++;
      } else {
        colors.blue++;
      }
    } else if (r > 150 && g > 150 && b < 100) {
      colors.yellow++;
    } else if (r > 80 && r < 150 && g > 40 && g < 100 && b < 60) {
      colors.brown++;
    }
  }
  
  // Convert to percentages
  const percentages: Record<string, number> = {};
  for (const [color, count] of Object.entries(colors)) {
    percentages[color] = totalPixels > 0 ? count / totalPixels : 0;
  }
  
  return percentages;
}

/**
 * Advanced waste type determination using HSV color analysis
 */
function determineWasteTypeFromAdvancedColors(colorAnalysis: ColorAnalysis) {
  console.log('🎨 Advanced color analysis:', colorAnalysis);

  const colors = colorAnalysis.colorDistribution;
  const dominantColors = colorAnalysis.dominantColors;
  const brightness = colorAnalysis.brightness;
  const saturation = colorAnalysis.saturation;

  // Advanced scoring system with context awareness
  const scores = {
    plastic: 0,
    paper: 0,
    metal: 0,
    glass: 0,
    electronics: 0,
    organic: 0
  };

  // Plastic detection (bottles, containers, bags)
  scores.plastic += colors.blue * 0.9;      // Blue plastic bottles
  scores.plastic += colors.clear * 0.8;     // Clear plastic containers
  scores.plastic += colors.white * 0.7;     // White plastic items
  scores.plastic += colors.red * 0.6;       // Red plastic items
  scores.plastic += colors.yellow * 0.6;    // Yellow plastic items
  scores.plastic += colors.orange * 0.6;    // Orange plastic items

  // High brightness + low saturation often indicates plastic
  if (brightness > 70 && saturation < 30) {
    scores.plastic += 0.3;
  }

  // Paper detection (cardboard, documents)
  scores.paper += colors.brown * 0.9;       // Cardboard brown
  scores.paper += colors.white * 0.5;       // White paper (lower than plastic)

  // Brown + moderate brightness suggests cardboard
  if (colors.brown > 0.2 && brightness > 40 && brightness < 80) {
    scores.paper += 0.4;
  }

  // Metal detection (cans, foil)
  scores.metal += colors.metallic * 0.95;   // Metallic shine
  scores.metal += colors.gray * 0.8;        // Gray metal
  scores.metal += colors.black * 0.3;       // Dark metal

  // Low saturation + moderate brightness suggests metal
  if (saturation < 15 && brightness > 30 && brightness < 70) {
    scores.metal += 0.3;
  }

  // Glass detection (bottles, jars)
  scores.glass += colors.green * 0.8;       // Green glass bottles
  scores.glass += colors.clear * 0.4;       // Clear glass (lower than plastic)
  scores.glass += colors.brown * 0.3;       // Brown glass bottles

  // Electronics detection (phones, computers)
  scores.electronics += colors.black * 0.9; // Black electronics
  scores.electronics += colors.gray * 0.4;  // Gray electronics

  // Very low brightness suggests electronics
  if (brightness < 25) {
    scores.electronics += 0.3;
  }

  // Organic waste detection (food, plants)
  scores.organic += colors.green * 0.7;     // Green vegetation
  scores.organic += colors.brown * 0.5;     // Brown organic matter
  scores.organic += colors.orange * 0.3;    // Orange peels, etc.

  console.log('📊 Advanced scoring results:', scores);

  // Find the highest scoring type
  let bestType = 'plastic';
  let bestScore = scores.plastic;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }

  // Calculate confidence with multiple factors
  let confidence = Math.min(bestScore * 0.7 + 0.3, 0.95);

  // Boost confidence for strong indicators
  if (bestType === 'metal' && (colors.metallic > 0.3 || colors.gray > 0.4)) {
    confidence = Math.min(confidence + 0.15, 0.95);
  }
  if (bestType === 'paper' && colors.brown > 0.4) {
    confidence = Math.min(confidence + 0.15, 0.95);
  }
  if (bestType === 'plastic' && (colors.blue > 0.3 || colors.clear > 0.4)) {
    confidence = Math.min(confidence + 0.15, 0.95);
  }
  if (bestType === 'glass' && colors.green > 0.4) {
    confidence = Math.min(confidence + 0.15, 0.95);
  }

  // Reduce confidence for ambiguous cases
  if (bestScore < 0.3) {
    confidence *= 0.7;
  }

  // Generate appropriate labels
  const labels = {
    plastic: colors.blue > 0.3 ? 'plastic bottle' :
             colors.clear > 0.3 ? 'plastic container' :
             colors.white > 0.5 ? 'plastic cup' : 'plastic item',
    paper: colors.brown > colors.white ? 'cardboard box' : 'paper document',
    metal: colors.metallic > 0.2 ? 'aluminum can' : 'metal container',
    glass: colors.green > 0.3 ? 'glass bottle' : 'glass jar',
    electronics: 'electronic device',
    organic: colors.green > colors.brown ? 'plant matter' : 'organic waste'
  };

  console.log(`🏆 Advanced detection: ${bestType} (${labels[bestType as keyof typeof labels]}) - confidence: ${confidence.toFixed(3)}`);

  return {
    type: bestType,
    confidence,
    label: labels[bestType as keyof typeof labels]
  };
}

/**
 * Determine waste type from color analysis (legacy function)
 */
function determineWasteTypeFromColors(colors: Record<string, number>) {
  console.log('🎨 Color analysis:', colors);

  // Enhanced scoring with better logic for white objects
  const scores = {
    plastic: (colors.white * 0.9) + (colors.blue * 0.8) + (colors.clear * 0.7) + (colors.red * 0.6) + (colors.yellow * 0.6) + (colors.orange * 0.6),
    paper: (colors.white * 0.7) + (colors.brown * 0.9), // Reduce white weight for paper vs plastic
    metal: (colors.gray * 0.9) + (colors.metallic * 0.95) + (colors.black * 0.4),
    glass: (colors.green * 0.7) + (colors.clear * 0.6) + (colors.blue * 0.3), // Reduce clear weight for glass
    electronics: (colors.black * 0.8) + (colors.gray * 0.3),
    organic: (colors.green * 0.6) + (colors.brown * 0.4)
  };

  console.log('📊 Initial scores:', scores);

  // Special logic for predominantly white objects
  if (colors.white > 0.6) {
    // If it's very white, it's more likely plastic (cups, containers) than paper
    scores.plastic += 0.3;
    scores.paper -= 0.2;
    console.log('🥤 Detected predominantly white object - boosting plastic score');
  }

  // If there's significant gray/metallic, boost metal score
  if (colors.gray > 0.2 || colors.metallic > 0.1) {
    scores.metal += 0.2;
    console.log('🔩 Detected metallic properties - boosting metal score');
  }

  // If there's brown with white, it's likely cardboard/paper
  if (colors.brown > 0.2 && colors.white > 0.3) {
    scores.paper += 0.3;
    console.log('📦 Detected brown+white - boosting paper score');
  }

  console.log('📊 Final scores:', scores);

  // Find the highest scoring type
  let bestType = 'plastic';
  let bestScore = scores.plastic;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }

  console.log(`🏆 Best match: ${bestType} with score ${bestScore}`);

  // Calculate confidence based on score and color distribution
  let confidence = Math.min(bestScore * 0.8 + 0.4, 0.9); // More conservative confidence

  // Boost confidence for clear indicators
  if (bestType === 'metal' && (colors.metallic > 0.2 || colors.gray > 0.3)) {
    confidence = Math.min(confidence + 0.1, 0.9);
  }
  if (bestType === 'paper' && colors.brown > 0.3) {
    confidence = Math.min(confidence + 0.1, 0.9);
  }
  if (bestType === 'plastic' && colors.white > 0.5) {
    confidence = Math.min(confidence + 0.1, 0.9);
  }

  const labels = {
    plastic: colors.white > 0.5 ? 'plastic cup' : 'plastic bottle',
    paper: colors.brown > colors.white ? 'cardboard box' : 'paper sheet',
    metal: 'metal can',
    glass: 'glass bottle',
    electronics: 'electronic device',
    organic: 'organic waste'
  };

  return {
    type: bestType,
    confidence,
    label: labels[bestType as keyof typeof labels]
  };
}

/**
 * Analyze image shape characteristics
 */
async function analyzeImageShape(imageUrl: string): Promise<Partial<WasteDetectionResult>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ confidence: 0 });
          return;
        }

        // Use moderate resolution for shape analysis
        const maxSize = 256;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = Math.floor(img.width * ratio);
        canvas.height = Math.floor(img.height * ratio);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Perform edge detection and shape analysis
        const shapeFeatures = extractShapeFeatures(imageData);
        const wasteType = determineWasteTypeFromShape(shapeFeatures);

        resolve({
          wasteType: wasteType.type,
          confidence: wasteType.confidence,
          label: wasteType.label,
          quality: wasteType.confidence > 0.7 ? 'good' : 'fair'
        });

      } catch (error) {
        console.error('Shape analysis error:', error);
        resolve({ confidence: 0 });
      }
    };

    img.onerror = () => resolve({ confidence: 0 });
    img.src = imageUrl;
  });
}

/**
 * Analyze image texture characteristics
 */
async function analyzeImageTexture(imageUrl: string): Promise<Partial<WasteDetectionResult>> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ confidence: 0 });
          return;
        }

        // Use smaller resolution for texture analysis (faster)
        const maxSize = 128;
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = Math.floor(img.width * ratio);
        canvas.height = Math.floor(img.height * ratio);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Perform texture analysis
        const textureFeatures = extractTextureFeatures(imageData);
        const wasteType = determineWasteTypeFromTexture(textureFeatures);

        resolve({
          wasteType: wasteType.type,
          confidence: wasteType.confidence,
          label: wasteType.label,
          quality: wasteType.confidence > 0.6 ? 'good' : 'fair'
        });

      } catch (error) {
        console.error('Texture analysis error:', error);
        resolve({ confidence: 0 });
      }
    };

    img.onerror = () => resolve({ confidence: 0 });
    img.src = imageUrl;
  });
}

/**
 * Extract shape features from image data
 */
function extractShapeFeatures(imageData: ImageData): ShapeAnalysis {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Convert to grayscale and apply edge detection
  const edges = applyCannyEdgeDetection(data, width, height);

  // Calculate shape metrics
  let edgePixels = 0;
  let totalPixels = width * height;

  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > 128) edgePixels++;
  }

  const edgeDensity = edgePixels / totalPixels;
  const aspectRatio = width / height;

  // Estimate circularity and rectangularity (simplified)
  const circularity = estimateCircularity(edges, width, height);
  const rectangularity = estimateRectangularity(edges, width, height);

  return {
    edges: edgePixels,
    corners: Math.floor(edgePixels / 20), // Simplified corner estimation
    roundness: circularity,
    aspectRatio,
    circularity,
    rectangularity,
    edgeDensity,
    contourCount: Math.floor(edgePixels / 10) // Simplified contour estimation
  };
}

/**
 * Extract texture features from image data
 */
function extractTextureFeatures(imageData: ImageData): TextureAnalysis {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Convert to grayscale
  const grayscale = new Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    grayscale[i / 4] = gray;
  }

  // Calculate texture metrics
  let variance = 0;
  let entropy = 0;
  const histogram = new Array(256).fill(0);

  // Calculate histogram and variance
  const mean = grayscale.reduce((sum, val) => sum + val, 0) / grayscale.length;

  for (const pixel of grayscale) {
    variance += Math.pow(pixel - mean, 2);
    histogram[pixel]++;
  }

  variance /= grayscale.length;

  // Calculate entropy
  for (let i = 0; i < 256; i++) {
    if (histogram[i] > 0) {
      const p = histogram[i] / grayscale.length;
      entropy -= p * Math.log2(p);
    }
  }

  const smoothness = 1 - (1 / (1 + variance));
  const uniformity = histogram.reduce((sum, count) => sum + Math.pow(count / grayscale.length, 2), 0);

  return {
    smoothness,
    roughness: 1 - smoothness,
    patterns: entropy / 8, // Simplified pattern detection based on entropy
    uniformity,
    entropy
  };
}

/**
 * Simple edge detection using Sobel operator
 */
function applyCannyEdgeDetection(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
  const edges = new Uint8Array(width * height);

  // Sobel kernels
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
          const kernelIdx = (ky + 1) * 3 + (kx + 1);

          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edges[y * width + x] = Math.min(255, magnitude);
    }
  }

  return edges;
}

/**
 * Estimate circularity of detected edges
 */
function estimateCircularity(edges: Uint8Array, width: number, height: number): number {
  // Simplified circularity estimation based on edge distribution
  const centerX = width / 2;
  const centerY = height / 2;
  let edgeCount = 0;
  let distanceSum = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y * width + x] > 128) {
        edgeCount++;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        distanceSum += distance;
      }
    }
  }

  if (edgeCount === 0) return 0;

  const avgDistance = distanceSum / edgeCount;
  const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));

  // Higher values indicate more circular shapes
  return Math.max(0, 1 - (avgDistance / maxDistance));
}

/**
 * Estimate rectangularity of detected edges
 */
function estimateRectangularity(edges: Uint8Array, width: number, height: number): number {
  // Count edges near the borders (rectangular objects have more border edges)
  let borderEdges = 0;
  let totalEdges = 0;

  const borderThreshold = Math.min(width, height) * 0.1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y * width + x] > 128) {
        totalEdges++;

        if (x < borderThreshold || x > width - borderThreshold ||
            y < borderThreshold || y > height - borderThreshold) {
          borderEdges++;
        }
      }
    }
  }

  return totalEdges > 0 ? borderEdges / totalEdges : 0;
}

/**
 * Determine waste type from shape analysis
 */
function determineWasteTypeFromShape(shapeFeatures: ShapeAnalysis) {
  console.log('📐 Shape analysis:', shapeFeatures);

  const scores = {
    plastic: 0,
    paper: 0,
    metal: 0,
    glass: 0,
    electronics: 0,
    organic: 0
  };

  // Bottles (plastic/glass) tend to be more circular
  if (shapeFeatures.circularity > 0.6) {
    scores.plastic += 0.4;
    scores.glass += 0.3;
  }

  // Rectangular shapes suggest boxes, electronics, or cans
  if (shapeFeatures.rectangularity > 0.6) {
    scores.paper += 0.5;      // Cardboard boxes
    scores.electronics += 0.4; // Electronic devices
    scores.metal += 0.3;       // Metal cans
  }

  // High edge density suggests complex shapes (electronics) or crumpled materials
  if (shapeFeatures.edgeDensity > 0.3) {
    scores.electronics += 0.3;
    scores.organic += 0.2;     // Organic waste can be irregular
  }

  // Aspect ratio analysis
  if (shapeFeatures.aspectRatio > 2 || shapeFeatures.aspectRatio < 0.5) {
    scores.plastic += 0.2;     // Bottles can be tall/thin
    scores.electronics += 0.2; // Cables, phones
  }

  let bestType = 'plastic';
  let bestScore = scores.plastic;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }

  const confidence = Math.min(bestScore + 0.3, 0.8); // Shape analysis is less reliable

  return {
    type: bestType,
    confidence,
    label: `${bestType} item`
  };
}

/**
 * Determine waste type from texture analysis
 */
function determineWasteTypeFromTexture(textureFeatures: TextureAnalysis) {
  console.log('🔍 Texture analysis:', textureFeatures);

  const scores = {
    plastic: 0,
    paper: 0,
    metal: 0,
    glass: 0,
    electronics: 0,
    organic: 0
  };

  // Smooth surfaces suggest plastic or glass
  if (textureFeatures.smoothness > 0.7) {
    scores.plastic += 0.4;
    scores.glass += 0.3;
  }

  // Rough surfaces suggest paper or organic materials
  if (textureFeatures.roughness > 0.6) {
    scores.paper += 0.4;
    scores.organic += 0.3;
  }

  // High uniformity suggests manufactured materials
  if (textureFeatures.uniformity > 0.8) {
    scores.plastic += 0.3;
    scores.metal += 0.3;
    scores.electronics += 0.2;
  }

  // High entropy suggests complex textures (electronics, organic)
  if (textureFeatures.entropy > 6) {
    scores.electronics += 0.3;
    scores.organic += 0.2;
  }

  let bestType = 'plastic';
  let bestScore = scores.plastic;

  for (const [type, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestType = type;
      bestScore = score;
    }
  }

  const confidence = Math.min(bestScore + 0.2, 0.7); // Texture analysis is supplementary

  return {
    type: bestType,
    confidence,
    label: `${bestType} item`
  };
}

/**
 * Analyze filename for waste type hints
 */
async function analyzeFilename(filename: string): Promise<Partial<WasteDetectionResult>> {
  const name = filename.toLowerCase();
  
  const keywords = {
    plastic: ['plastic', 'bottle', 'container', 'pet', 'hdpe', 'pp', 'wrapper', 'bag'],
    paper: ['paper', 'cardboard', 'carton', 'box', 'document', 'receipt'],
    metal: ['metal', 'can', 'aluminum', 'tin', 'steel', 'foil'],
    glass: ['glass', 'jar', 'bottle', 'wine', 'beer'],
    electronics: ['phone', 'computer', 'battery', 'electronic', 'device', 'cable'],
    organic: ['food', 'fruit', 'vegetable', 'organic', 'compost', 'leaf']
  };
  
  let bestMatch = { type: 'plastic', score: 0, label: 'unknown item' };
  
  for (const [type, words] of Object.entries(keywords)) {
    let score = 0;
    let matchedWord = '';
    
    for (const word of words) {
      if (name.includes(word)) {
        score += word.length; // Longer matches get higher scores
        if (word.length > matchedWord.length) {
          matchedWord = word;
        }
      }
    }
    
    if (score > bestMatch.score) {
      bestMatch = {
        type,
        score,
        label: matchedWord || type
      };
    }
  }
  
  const confidence = Math.min(bestMatch.score * 0.1 + 0.4, 0.8);
  
  return {
    wasteType: bestMatch.type,
    confidence,
    label: bestMatch.label,
    quality: confidence > 0.7 ? 'good' : 'fair'
  };
}

/**
 * Analyze image metadata
 */
async function analyzeImageMetadata(file: File): Promise<Partial<WasteDetectionResult>> {
  const size = file.size;
  const type = file.type;
  
  let confidence = 0.3; // Base confidence for metadata
  let wasteType = 'plastic'; // Default
  
  // Large images are more likely to be real photos
  if (size > 500000) {
    confidence += 0.1;
  }
  
  // JPEG images are typically photos
  if (type.includes('jpeg') || type.includes('jpg')) {
    confidence += 0.1;
  }
  
  return {
    wasteType,
    confidence,
    quality: 'fair'
  };
}

/**
 * Advanced ensemble method to combine multiple analysis results
 */
function combineAdvancedAnalysisResults(
  colorResult: Partial<WasteDetectionResult>,
  shapeResult: Partial<WasteDetectionResult>,
  textureResult: Partial<WasteDetectionResult>,
  filenameResult: Partial<WasteDetectionResult>,
  metadataResult: Partial<WasteDetectionResult>
): WasteDetectionResult {

  console.log('🔬 Combining advanced analysis results...');

  // Advanced weighting system
  const weights = {
    color: 0.45,      // Most reliable for waste detection
    shape: 0.25,      // Good for distinguishing bottles vs boxes
    texture: 0.15,    // Supplementary information
    filename: 0.10,   // Helpful but not always accurate
    metadata: 0.05    // Least reliable
  };

  const results = [
    { result: colorResult, weight: weights.color, source: 'color' },
    { result: shapeResult, weight: weights.shape, source: 'shape' },
    { result: textureResult, weight: weights.texture, source: 'texture' },
    { result: filenameResult, weight: weights.filename, source: 'filename' },
    { result: metadataResult, weight: weights.metadata, source: 'metadata' }
  ];

  // Calculate weighted scores for each waste type
  const wasteTypeScores: Record<string, number> = {};
  const wasteTypeVotes: Record<string, number> = {};

  for (const { result, weight, source } of results) {
    if (result.wasteType && result.confidence && result.confidence > 0.1) {
      const type = result.wasteType.toLowerCase();
      const score = result.confidence * weight;

      wasteTypeScores[type] = (wasteTypeScores[type] || 0) + score;
      wasteTypeVotes[type] = (wasteTypeVotes[type] || 0) + 1;

      console.log(`📊 ${source}: ${type} (confidence: ${result.confidence.toFixed(3)}, weighted: ${score.toFixed(3)})`);
    }
  }

  // Find the best waste type
  let bestType = 'plastic';
  let bestScore = 0;
  let bestVotes = 0;

  for (const [type, score] of Object.entries(wasteTypeScores)) {
    const votes = wasteTypeVotes[type];

    // Prefer types with both high scores and multiple votes
    const adjustedScore = score * (1 + votes * 0.1);

    if (adjustedScore > bestScore) {
      bestType = type;
      bestScore = score;
      bestVotes = votes;
    }
  }

  // Calculate ensemble confidence
  let ensembleConfidence = Math.min(bestScore * 1.5, 0.95);

  // Boost confidence for consensus
  if (bestVotes >= 3) {
    ensembleConfidence = Math.min(ensembleConfidence + 0.1, 0.95);
  }

  // Reduce confidence for low agreement
  if (bestVotes === 1) {
    ensembleConfidence *= 0.8;
  }

  // Generate appropriate label based on the best contributing analysis
  let bestLabel = bestType;
  let bestSource = 'ensemble';

  for (const { result, source } of results) {
    if (result.wasteType?.toLowerCase() === bestType && result.label) {
      bestLabel = result.label;
      bestSource = source;
      break;
    }
  }

  console.log(`🎯 Ensemble result: ${bestType} (${bestLabel}) - confidence: ${ensembleConfidence.toFixed(3)} from ${bestVotes} votes`);

  return {
    wasteType: bestType.charAt(0).toUpperCase() + bestType.slice(1),
    confidence: ensembleConfidence,
    label: bestLabel,
    detailedType: `${bestType.charAt(0).toUpperCase() + bestType.slice(1)} (${bestLabel}) - ${bestSource} analysis`,
    quality: ensembleConfidence > 0.85 ? 'excellent' :
             ensembleConfidence > 0.7 ? 'good' :
             ensembleConfidence > 0.5 ? 'fair' : 'poor',
    allDetections: [{
      class: bestLabel.replace(/\s+/g, '_'),
      wasteType: bestType,
      score: ensembleConfidence,
      bbox: [0.1, 0.1, 0.8, 0.8]
    }]
  };
}

/**
 * Fallback result when analysis fails
 */
function getFallbackResult(filename: string): WasteDetectionResult {
  const name = filename.toLowerCase();
  
  let wasteType = 'plastic';
  let label = 'plastic bottle';
  
  if (name.includes('paper') || name.includes('card')) {
    wasteType = 'paper';
    label = 'paper item';
  } else if (name.includes('metal') || name.includes('can')) {
    wasteType = 'metal';
    label = 'metal can';
  } else if (name.includes('glass')) {
    wasteType = 'glass';
    label = 'glass bottle';
  }
  
  return {
    wasteType: wasteType.charAt(0).toUpperCase() + wasteType.slice(1),
    confidence: 0.65,
    label,
    detailedType: `${wasteType.charAt(0).toUpperCase() + wasteType.slice(1)} (${label})`,
    quality: 'fair',
    allDetections: [{
      class: label.replace(/\s+/g, '_'),
      wasteType,
      score: 0.65,
      bbox: [0.1, 0.1, 0.8, 0.8]
    }]
  };
}

/**
 * Combine results from different analysis methods
 */
function combineResults(
  colorResult: Partial<WasteDetectionResult>,
  filenameResult: Partial<WasteDetectionResult>,
  imageFile: File
): WasteDetectionResult {
  // Use color result as primary, filename as fallback
  const wasteType = colorResult.wasteType || filenameResult.wasteType || 'plastic';
  const confidence = Math.max(colorResult.confidence || 0, filenameResult.confidence || 0);
  const label = colorResult.label || filenameResult.label || 'unknown item';

  return {
    wasteType: wasteType.charAt(0).toUpperCase() + wasteType.slice(1),
    confidence,
    label,
    detailedType: `${wasteType.charAt(0).toUpperCase() + wasteType.slice(1)} (${label})`,
    quality: confidence > 0.8 ? 'excellent' : confidence > 0.6 ? 'good' : 'fair',
    allDetections: [{
      class: label.replace(/\s+/g, '_'),
      wasteType,
      score: confidence,
      bbox: [0.1, 0.1, 0.8, 0.8]
    }]
  };
}


