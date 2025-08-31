import { WasteDetector, WasteAnalysisResult } from './waste-detector';

// Simple image analysis interface for COCO-SSD based detection
export class ImageAnalysis {
  private detector: WasteDetector | null = null;

  async analyzeWasteImage(imageFile: File): Promise<WasteAnalysisResult> {
    try {
      console.log('🔍 Starting image analysis with COCO-SSD...');
      
      if (!this.detector) {
        this.detector = new WasteDetector();
      }

      // Create image element from file
      const imageElement = await this.createImageElement(imageFile);
      
      // Run detection
      const result = await this.detector.detectWaste(imageElement);
      
      console.log('✅ Analysis complete:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Image analysis failed:', error);
      throw new Error(`Image analysis failed: ${error}`);
    }
  }

  private async createImageElement(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  getModelStatus() {
    return {
      isLoaded: this.detector !== null,
      backend: 'coco-ssd',
      modelType: 'COCO-SSD'
    };
  }
}

// Export singleton instance
export const imageAnalysis = new ImageAnalysis();

// Export individual functions for compatibility
export async function analyzeWasteImage(imageFile: File): Promise<WasteAnalysisResult> {
  return imageAnalysis.analyzeWasteImage(imageFile);
}

export function getModelStatus() {
  return imageAnalysis.getModelStatus();
}