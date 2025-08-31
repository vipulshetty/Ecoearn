import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

export class AIModelDetection {
  private model: cocoSsd.ObjectDetection | null = null;
  private isInitialized = false;

  async initializeModel(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🤖 Initializing COCO-SSD model...');
      
      // Set TensorFlow backend
      await tf.setBackend('webgl').catch(async () => {
        console.warn('⚠️ WebGL failed, using CPU backend');
        await tf.setBackend('cpu');
      });

      // Load COCO-SSD model
      this.model = await cocoSsd.load();
      this.isInitialized = true;
      
      console.log('✅ COCO-SSD model loaded successfully');
      console.log('🔧 Backend:', tf.getBackend());
      
    } catch (error) {
      console.error('❌ Failed to initialize model:', error);
      throw error;
    }
  }

  async detectObjects(imageElement: HTMLImageElement) {
    if (!this.model) {
      await this.initializeModel();
    }

    try {
      const predictions = await this.model!.detect(imageElement);
      return predictions;
    } catch (error) {
      console.error('❌ Detection failed:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isLoaded: this.isInitialized && this.model !== null,
      backend: tf.getBackend(),
      modelType: 'COCO-SSD'
    };
  }

  dispose() {
    if (this.model) {
      this.model = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const aiModelDetection = new AIModelDetection();