import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export enum WasteCategory {
  PLASTIC = 'plastic',
  PAPER = 'paper',
  GLASS = 'glass',
  METAL = 'metal',
  ORGANIC = 'organic',
  ELECTRONIC = 'electronic',
  OTHER = 'other'
}

export interface DetectionResult {
  className: string;
  wasteCategory: WasteCategory;
  confidence: number;
  bbox: {x: number; y: number; width: number; height: number;};
}

export interface WasteAnalysisResult {
  detections: DetectionResult[];
  primaryWasteType: WasteCategory;
  confidence: number;
  recyclable: boolean;
  points: number;
}

export class WasteDetector {
  private model: cocoSsd.ObjectDetection | null = null;
  private classMapping: Record<string, WasteCategory> = {
    // Plastic items - expanded mapping
    'bottle': WasteCategory.PLASTIC,
    'cup': WasteCategory.PLASTIC,
    'bowl': WasteCategory.PLASTIC,
    'sports ball': WasteCategory.PLASTIC,
    'frisbee': WasteCategory.PLASTIC,
    'umbrella': WasteCategory.PLASTIC,
    'handbag': WasteCategory.PLASTIC,
    'suitcase': WasteCategory.PLASTIC,
    
    // Glass items
    'wine glass': WasteCategory.GLASS,
    'vase': WasteCategory.GLASS,
    
    // Metal items
    'fork': WasteCategory.METAL,
    'knife': WasteCategory.METAL,
    'spoon': WasteCategory.METAL,
    'scissors': WasteCategory.METAL,
    
    // Paper items
    'book': WasteCategory.PAPER,
    
    // Electronic items - expanded
    'cell phone': WasteCategory.ELECTRONIC,
    'laptop': WasteCategory.ELECTRONIC,
    'keyboard': WasteCategory.ELECTRONIC,
    'mouse': WasteCategory.ELECTRONIC,
    'remote': WasteCategory.ELECTRONIC,
    'tv': WasteCategory.ELECTRONIC,
    'microwave': WasteCategory.ELECTRONIC,
    'oven': WasteCategory.ELECTRONIC,
    'toaster': WasteCategory.ELECTRONIC,
    'hair drier': WasteCategory.ELECTRONIC,
    
    // Organic items - expanded
    'banana': WasteCategory.ORGANIC,
    'apple': WasteCategory.ORGANIC,
    'orange': WasteCategory.ORGANIC,
    'carrot': WasteCategory.ORGANIC,
    'broccoli': WasteCategory.ORGANIC,
    'hot dog': WasteCategory.ORGANIC,
    'pizza': WasteCategory.ORGANIC,
    'donut': WasteCategory.ORGANIC,
    'cake': WasteCategory.ORGANIC,
    'sandwich': WasteCategory.ORGANIC
  };

  constructor() {
    this.initTensorflow();
  }

  private async initTensorflow(): Promise<void> {
    try {
      console.log('🔧 Initializing TensorFlow.js...');
      await tf.setBackend('webgl').catch(async () => {
        console.warn('⚠️ WebGL failed, falling back to CPU');
        await tf.setBackend('cpu');
      });
      console.log('✅ TensorFlow.js backend:', tf.getBackend());
    } catch (error) {
      console.error('❌ TensorFlow.js initialization failed:', error);
    }
  }

  public async loadModel(): Promise<void> {
    if (this.model) return;
    try {
      console.log('🤖 Loading COCO-SSD model...');
      await this.initTensorflow();
      this.model = await cocoSsd.load();
      console.log('✅ COCO-SSD model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load COCO-SSD model:', error);
      throw new Error(`Model loading failed: ${error}`);
    }
  }

  public async detectWaste(imageElement: HTMLImageElement): Promise<WasteAnalysisResult> {
    if (!this.model) await this.loadModel();
    
    try {
      console.log('🔍 Running enhanced COCO-SSD detection...');
      
      // Multi-scale detection for better accuracy
      const allDetections = await this.performMultiScaleDetection(imageElement);
      console.log('🎯 Raw predictions from all scales:', allDetections);
      
      // Lower confidence threshold for better detection
      const filteredPredictions = allDetections.filter(pred => pred.score > 0.2);
      
      const detections = filteredPredictions.map(pred => ({
        className: pred.class,
        wasteCategory: this.classMapping[pred.class] || WasteCategory.OTHER,
        confidence: pred.score,
        bbox: {
          x: pred.bbox[0],
          y: pred.bbox[1],
          width: pred.bbox[2],
          height: pred.bbox[3]
        }
      }));
      
      // Apply waste-specific confidence boosting
      const enhancedDetections = this.enhanceWasteDetections(detections);
      
      console.log('♻️ Enhanced detections:', enhancedDetections);
      return this.analyzeResults(enhancedDetections);
    } catch (error) {
      console.error('❌ COCO-SSD detection error:', error);
      return this.getFallbackResult();
    }
  }

  private async performMultiScaleDetection(imageElement: HTMLImageElement): Promise<any[]> {
    const allDetections: any[] = [];
    
    try {
      // Original scale detection
      const originalDetections = await this.model!.detect(imageElement);
      allDetections.push(...originalDetections);
      
      // Create scaled versions for better detection
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Scale up for small objects (1.5x)
        canvas.width = imageElement.width * 1.5;
        canvas.height = imageElement.height * 1.5;
        ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
        
        const scaledDetections = await this.model!.detect(canvas);
        // Adjust bounding boxes back to original scale
        const adjustedDetections = scaledDetections.map(det => ({
          ...det,
          bbox: [det.bbox[0] / 1.5, det.bbox[1] / 1.5, det.bbox[2] / 1.5, det.bbox[3] / 1.5]
        }));
        allDetections.push(...adjustedDetections);
      }
      
    } catch (error) {
      console.warn('⚠️ Multi-scale detection failed, using original only:', error);
    }
    
    // Remove duplicates and return unique detections
    return this.removeDuplicateDetections(allDetections);
  }
  
  private removeDuplicateDetections(detections: any[]): any[] {
    const unique: any[] = [];
    
    for (const detection of detections) {
      const isDuplicate = unique.some(existing => 
        existing.class === detection.class &&
        Math.abs(existing.bbox[0] - detection.bbox[0]) < 20 &&
        Math.abs(existing.bbox[1] - detection.bbox[1]) < 20
      );
      
      if (!isDuplicate) {
        unique.push(detection);
      } else {
        // Keep the one with higher confidence
        const existingIndex = unique.findIndex(existing => 
          existing.class === detection.class &&
          Math.abs(existing.bbox[0] - detection.bbox[0]) < 20 &&
          Math.abs(existing.bbox[1] - detection.bbox[1]) < 20
        );
        
        if (detection.score > unique[existingIndex].score) {
          unique[existingIndex] = detection;
        }
      }
    }
    
    return unique;
  }
  
  private enhanceWasteDetections(detections: DetectionResult[]): DetectionResult[] {
    return detections.map(detection => {
      let enhancedConfidence = detection.confidence;
      
      // Boost confidence for waste-relevant items
      const wasteRelevantItems = [
        'bottle', 'cup', 'bowl', 'fork', 'knife', 'spoon',
        'wine glass', 'cell phone', 'laptop', 'book'
      ];
      
      if (wasteRelevantItems.includes(detection.className)) {
        enhancedConfidence = Math.min(detection.confidence * 1.2, 0.95);
      }
      
      // Extra boost for commonly discarded items
      const commonWasteItems = ['bottle', 'cup', 'cell phone'];
      if (commonWasteItems.includes(detection.className)) {
        enhancedConfidence = Math.min(enhancedConfidence * 1.1, 0.95);
      }
      
      return {
        ...detection,
        confidence: enhancedConfidence
      };
    });
  }

  private analyzeResults(detections: DetectionResult[]): WasteAnalysisResult {
    if (detections.length === 0) {
      return {
        detections: [],
        primaryWasteType: WasteCategory.OTHER,
        confidence: 0,
        recyclable: false,
        points: 0
      };
    }

    // Find most common waste type
    const typeCounts: Record<string, number> = {};
    const typeConfidence: Record<string, number> = {};
    
    detections.forEach(d => {
      typeCounts[d.wasteCategory] = (typeCounts[d.wasteCategory] || 0) + 1;
      typeConfidence[d.wasteCategory] = (typeConfidence[d.wasteCategory] || 0) + d.confidence;
    });

    let primaryType = WasteCategory.OTHER;
    let maxCount = 0;
    
    for (const type in typeCounts) {
      if (typeCounts[type] > maxCount) {
        maxCount = typeCounts[type];
        primaryType = type as WasteCategory;
      }
    }

    const confidence = typeConfidence[primaryType] / maxCount;
    const recyclable = [WasteCategory.PLASTIC, WasteCategory.PAPER, WasteCategory.GLASS, WasteCategory.METAL].includes(primaryType as WasteCategory);
    
    const pointsMap: Record<string, number> = {
      [WasteCategory.PLASTIC]: 10,
      [WasteCategory.PAPER]: 5,
      [WasteCategory.GLASS]: 15,
      [WasteCategory.METAL]: 20,
      [WasteCategory.ORGANIC]: 3,
      [WasteCategory.ELECTRONIC]: 25,
      [WasteCategory.OTHER]: 1
    };

    return {
      detections,
      primaryWasteType: primaryType as WasteCategory,
      confidence,
      recyclable,
      points: pointsMap[primaryType] || 0
    };
  }

  private getFallbackResult(): WasteAnalysisResult {
    return {
      detections: [],
      primaryWasteType: WasteCategory.OTHER,
      confidence: 0.5,
      recyclable: false,
      points: 1
    };
  }

  public dispose(): void {
    if (this.model) {
      // COCO-SSD models don't have a dispose method
      this.model = null;
    }
  }
}