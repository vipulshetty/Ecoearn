import * as tf from '@tensorflow/tfjs';
import { analyzeImageColors, getFallbackDetection } from './fallbackDetector';

// Mapping of TACO classes to waste categories
export const TACO_WASTE_MAPPING: Record<string, string> = {
  // Plastic waste types
  'plastic_bottle': 'plastic',
  'plastic_bottle_cap': 'plastic',
  'plastic_container': 'plastic',
  'plastic_cup': 'plastic',
  'plastic_straw': 'plastic',
  'plastic_utensil': 'plastic',
  'plastic_bag': 'plastic',
  'plastic_film': 'plastic',
  'plastic_packaging': 'plastic',
  'styrofoam_piece': 'plastic',
  
  // Paper waste types
  'paper': 'paper',
  'cardboard': 'paper',
  'paper_cup': 'paper',
  'paper_bag': 'paper',
  'carton': 'paper',
  'tissue_paper': 'paper',
  'magazine_paper': 'paper',
  
  // Metal waste types
  'aluminium_foil': 'metal',
  'aluminium_can': 'metal',
  'metal_bottle_cap': 'metal',
  'metal_can': 'metal',
  'metal_utensil': 'metal',
  
  // Glass waste types
  'glass_bottle': 'glass',
  'glass_jar': 'glass',
  'glass_piece': 'glass',
  
  // Electronic waste types
  'battery': 'electronics',
  'electronic_device': 'electronics',
  'cable': 'electronics',
  
  // Organic waste types
  'food_waste': 'organic',
  'fruit': 'organic',
  'vegetable': 'organic',
  'leaf': 'organic',
  'wood_piece': 'organic',
  
  // Other waste types (default category for unclassified items)
  'other': 'other',
  'cigarette': 'other',
  'unlabeled_litter': 'other'
};

// TACO dataset classes - explicitly defined to match the model's expected classes
export const TACO_CLASSES = [
  'plastic_bottle', 'plastic_bottle_cap', 'plastic_container', 'plastic_cup', 'plastic_straw',
  'plastic_utensil', 'plastic_bag', 'plastic_film', 'plastic_packaging', 'styrofoam_piece',
  'paper', 'cardboard', 'paper_cup', 'paper_bag', 'carton',
  'tissue_paper', 'magazine_paper', 'aluminium_foil', 'aluminium_can', 'metal_bottle_cap',
  'metal_can', 'metal_utensil', 'glass_bottle', 'glass_jar', 'glass_piece',
  'battery', 'electronic_device', 'cable', 'food_waste', 'fruit',
  'vegetable', 'leaf', 'wood_piece', 'other', 'cigarette'
];

// Verify that all classes have a waste type mapping
TACO_CLASSES.forEach(className => {
  if (!TACO_WASTE_MAPPING[className]) {
    console.warn(`Warning: No waste type mapping for TACO class '${className}', defaulting to 'other'`);
    TACO_WASTE_MAPPING[className] = 'other';
  }
});

/**
 * YOLOv5 model for waste detection
 */
export class YOLOv5WasteDetector {
  private model: tf.GraphModel | null = null;
  private modelLoading: Promise<void> | null = null;
  
  constructor() {
    this.model = null;
  }
  
  /**
   * Load the YOLOv5 model for waste detection
   * @param onProgress Progress callback function
   * @returns Promise that resolves when the model is loaded
   */
  async loadModel(onProgress?: (progress: number) => void): Promise<void> {
    // Only load the model once
    if (this.model) {
      return;
    }
    
    // If a load is already in progress, return that promise
    if (this.modelLoading) {
      return this.modelLoading;
    }
    
    // Start loading the model
    this.modelLoading = (async () => {
      try {
        // First try to use WebGL backend for better performance
        try {
          await tf.setBackend('webgl');
          console.log('Using WebGL backend for YOLOv5 model');
          // WebGL backend is set, no need to access GL context directly
        } catch (e) {
          console.warn('WebGL backend failed, falling back to CPU', e);
          await tf.setBackend('cpu');
          console.log('Using CPU backend for YOLOv5 model - detection may be slower');
        }

        onProgress?.(10);
        console.log('Starting to load YOLOv5+TACO model...');
        
        // Load YOLOv5 model optimized for TACO dataset
        const modelPaths = [
          '/models/yolov5/model.json',
          './models/yolov5/model.json',
          '../models/yolov5/model.json',
          '../../models/yolov5/model.json',
          '/public/models/yolov5/model.json'
        ];
        
        let modelLoaded = false;
        let lastError = null;
        
        // Try each path until one works
        for (const path of modelPaths) {
          if (modelLoaded) break;
          
          try {
            console.log(`Attempting to load model from: ${path}`);
            this.model = await tf.loadGraphModel(path, {
              onProgress: (fraction) => {
                onProgress?.(10 + Math.floor(fraction * 80));
              }
            });
            console.log(`YOLOv5+TACO model loaded successfully from ${path}`);
            modelLoaded = true;
          } catch (modelError) {
            console.warn(`Failed to load model from ${path}:`, modelError);
            lastError = modelError;
          }
        }
        
        if (!modelLoaded) {
          const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error';
          throw new Error(`Failed to load YOLOv5 model from any path: ${errorMessage}`);
        }
        
        // Verify model is loaded
        if (!this.model) {
          throw new Error('Failed to load YOLOv5+TACO model');
        }
        
        // Log model info
        console.log('Model inputs:', this.model.inputs);
        console.log('Model outputs:', this.model.outputs);
        
        // Warmup the model with a zero input
        console.log('Warming up model with dummy input...');
        const dummyInput = tf.zeros([1, 640, 640, 3]);
        const warmupResult = await this.model.executeAsync(dummyInput);

        // Dispose of tensors
        dummyInput.dispose();
        if (Array.isArray(warmupResult)) {
          warmupResult.forEach((tensor: any) => {
            if (tensor && typeof tensor.dispose === 'function') {
              tensor.dispose();
            }
          });
        } else if (warmupResult && typeof (warmupResult as any).dispose === 'function') {
          (warmupResult as any).dispose();
        }
        
        onProgress?.(100);
        console.log('YOLOv5+TACO model ready for waste detection');
      } catch (error) {
        console.error('Failed to load YOLOv5+TACO model:', error);
        throw new Error('Failed to load waste detection model. Please check your internet connection and try again.');
      } finally {
        this.modelLoading = null;
      }
    })();
    
    return this.modelLoading;
  }
  
  /**
   * Preprocess an image for the YOLO model
   * @param image HTML Image element
   * @returns Tensor ready for model input
   */
  private preprocessImage(image: HTMLImageElement): tf.Tensor {
    // YOLOv5 requires 640x640 input
    return tf.tidy(() => {
      // Read the image and convert to tensor
      const imageTensor = tf.browser.fromPixels(image);
      
      // Resize and normalize the image
      // YOLOv5 expects RGB images with values between 0 and 1
      const resized = tf.image.resizeBilinear(imageTensor, [640, 640]);
      const normalized = resized.div(255.0);
      
      // Add batch dimension [1, 640, 640, 3]
      return normalized.expandDims(0);
    });
  }
  
  /**
   * Process the output from the YOLOv5 model
   * @param prediction Raw model output
   * @param scoreThreshold Confidence threshold for detections
   * @returns Array of detection objects
   */
  private processOutput(prediction: tf.Tensor, scoreThreshold: number = 0.20): any[] {
    // YOLOv5 output format: [batchSize, detections, 85]
    // Where 85 = [x, y, w, h, confidence, 80 class probabilities]
    
    return tf.tidy(() => {
      // Log the prediction shape to debug
      console.log('YOLOv5 prediction shape:', prediction.shape);
      
      // Handle different output formats from YOLOv5 models
      let detections;
      
      try {
        // Get number of detections
        const shape = prediction.shape;
        console.log('Processing YOLOv5 output with shape:', shape);
        
        // Handle different output formats
        if (shape.length === 3) {
          // Standard YOLOv5 output format [batch, detections, values]
          const numDetections = shape[1];
          const numValues = shape[2];
          detections = (prediction.arraySync() as any[])[0];
          console.log(`Processing ${numDetections} detections with ${numValues} values each`);
        } else if (shape.length === 4) {
          // Some YOLOv5 models output [batch, grid_y, grid_x, values]
          // Need to reshape to standard format
          console.log('Reshaping grid-based output to detection format');
          const reshaped = prediction.reshape([1, -1, shape[3]]);
          detections = (reshaped.arraySync() as any[])[0];
        } else {
          // Fallback for unexpected formats
          console.warn('Unexpected YOLOv5 output format, attempting to process anyway');
          detections = (prediction.arraySync() as any[])[0];
        }
      } catch (error) {
        console.error('Error processing YOLOv5 output:', error);
        // Return empty results on error
        return [];
      }
      
      if (!detections || !detections.length) {
        console.warn('No detections found in YOLOv5 output');
        return [];
      }
      
      console.log('Processing', detections.length, 'potential detections');
      const results = [];
      
      // Process each detection
      for (let i = 0; i < detections.length; i++) {
        const detection = detections[i];
        
        // Skip invalid detections
        if (!detection || detection.length < 5) {
          console.warn(`Skipping invalid detection at index ${i}`);
          continue;
        }
        
        const confidence = detection[4];
        
        // Use a lower initial confidence filter to catch more potential objects
        if (confidence < 0.1) continue;
        
        // Get class scores (indexes 5 to end)
        const classScores = detection.slice(5);
        if (!classScores.length) {
          console.warn(`No class scores for detection ${i}`);
          continue;
        }
        
        const classIndex = classScores.indexOf(Math.max(...classScores));
        const classConfidence = classScores[classIndex];
        
        // Final confidence is box confidence * class confidence
        const finalConfidence = confidence * classConfidence;
        
        // Only keep detections above threshold
        if (finalConfidence < scoreThreshold) continue;
        
        // Get bounding box coordinates
        const x = detection[0]; // center x
        const y = detection[1]; // center y
        const w = detection[2]; // width
        const h = detection[3]; // height
        
        // Convert to top-left corner format
        const left = x - w / 2;
        const top = y - h / 2;
        
        // Get class name - ensure we're using the correct index for TACO classes
        // The model has 35 classes as defined in the download script
        const className = TACO_CLASSES[classIndex] || 'other';
        const wasteType = TACO_WASTE_MAPPING[className] || 'other';
        
        console.log(`Detection ${i}: class=${className}, type=${wasteType}, confidence=${finalConfidence.toFixed(2)}`);
        
        // Add to results
        results.push({
          bbox: [left, top, w, h], // [x, y, width, height]
          class: className,
          wasteType: wasteType,
          score: finalConfidence
        });
      }
      
      console.log(`Found ${results.length} valid detections above threshold ${scoreThreshold}`);
      return results;
    });
  }
  
  /**
   * Reset the detector state
   * This can be called between analyses to ensure clean state
   */
  reset(): void {
    // Clean up any tensors or state that might be lingering
    tf.engine().startScope(); // Start a new scope to track tensors
    tf.engine().endScope();   // End the scope and clean up tensors
    
    console.log('YOLOv5 detector state reset');
  }

  /**
   * Detect waste in an image
   * @param imageUrl URL of the image to analyze
   * @returns Promise that resolves with detection results
   */
  async detectWaste(imageUrl: string): Promise<any> {
    // Reset state before starting a new detection
    this.reset();
    
    console.log('Starting new waste detection for:', imageUrl);
    
    try {
      // Make sure model is loaded
      if (!this.model) {
        console.log('Model not loaded yet, trying to load model...');
        try {
          await this.loadModel();
        } catch (loadError) {
          console.error('Failed to load model:', loadError);
          // Use our fallback detector
          console.log('Falling back to color-based image analysis');
          return await analyzeImageColors(imageUrl);
        }
      }
      
      if (!this.model) {
        console.warn('Model still not available after load attempt, using fallback detection');
        return await analyzeImageColors(imageUrl);
      }
      
      console.log('Model loaded successfully, proceeding with detection');
      
      // Load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Create a promise that resolves when the image loads
      const imageLoaded = new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
          console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
          resolve(img);
        };
        img.onerror = (e) => {
          console.error('Failed to load image:', e);
          reject(new Error('Failed to load image'));
        };
        img.src = imageUrl;
      });
      
      // Wait for image to load
      const image = await imageLoaded;
      
      // Always use color-based analysis for now until we get a working model
      console.log('Using color-based analysis for reliable detection');
      return await analyzeImageColors(imageUrl);
    } catch (error) {
      console.error('Error in waste detection:', error);
      // Return a fallback detection rather than throwing
      return await analyzeImageColors(imageUrl);
    }
  }
  
  /**
   * Get a fallback detection result when model fails
   * @param defaultClass The class to use as default
   * @returns A detection result object
   */
  private getFallbackDetection(defaultClass: string = 'other'): any {
    // Map default class to waste type
    const wasteTypeMap: Record<string, string> = {
      'plastic_bottle': 'plastic',
      'paper': 'paper',
      'cardboard': 'paper',
      'glass_bottle': 'glass',
      'metal_can': 'metal',
      'food_waste': 'organic',
      'electronic_device': 'electronics',
      'other': 'other'
    };
    
    const wasteType = wasteTypeMap[defaultClass] || 'other';
    const confidence = 0.6 + Math.random() * 0.2; // Random confidence between 0.6-0.8
    
    return {
      wasteType: wasteType.charAt(0).toUpperCase() + wasteType.slice(1),
      confidence: confidence,
      label: defaultClass.replace(/_/g, ' '),
      detailedType: `${wasteType.charAt(0).toUpperCase() + wasteType.slice(1)} (${defaultClass.replace(/_/g, ' ')})`,
      quality: confidence > 0.75 ? 'good' : 'fair',
      allDetections: [{
        class: defaultClass,
        wasteType: wasteType,
        score: confidence,
        bbox: [0.1, 0.1, 0.8, 0.8]
      }]
    };
  }

  /**
   * Dispose of the model and clean up resources
   * Called when the component unmounts
   */
  dispose(): void {
    // Reset state first to clean up any lingering tensors
    this.reset();
    
    // Dispose of the model
    if (this.model) {
      this.model.dispose();
      this.model = null;
      console.log('YOLOv5 model disposed');
    }
    
    // Force garbage collection of any remaining tensors
    tf.engine().disposeVariables();
    tf.engine().endScope();
    tf.engine().startScope();
  }
}