# EcoEarn - Waste Classification App

EcoEarn is a Next.js application that helps users classify waste items and earn points for recycling properly.

## Features

- **YOLOv5 + TACO Waste Detection**: Uses the YOLOv5 object detection model trained on the TACO (Trash Annotations in Context) dataset for accurate waste classification
- **Client-side processing**: All image analysis happens in the browser for privacy and speed
- **Points system**: Earn points based on waste type and quality
- **User authentication**: Track your recycling progress over time

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ecoearn.git
   cd ecoearn
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the YOLOv5 + TACO model:
   ```
   npm run download-model
   ```
   This will download and convert the YOLOv5 model optimized for waste detection.

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Waste Classifier

1. Navigate to the Analyze page
2. Upload an image of the waste item
3. The YOLOv5+TACO model will analyze the image directly in your browser
4. Review the classification result (waste type, quality, confidence)
5. Submit the result to earn points

## Technical Details

### YOLOv5 + TACO Integration

The application uses YOLOv5, a state-of-the-art object detection model, trained on the TACO dataset specifically for waste detection. This provides superior accuracy for recognizing various types of waste compared to general-purpose image classification models.

Key advantages:
- Specialized for waste detection with classes like "plastic_bottle", "metal_can", etc.
- Runs entirely in the browser using TensorFlow.js
- Handles multiple objects in a single image
- Higher accuracy for waste-specific categories

### Model Architecture

- **Model**: YOLOv5s (smaller version optimized for browser)
- **Input**: 640x640 RGB images
- **Output**: Bounding boxes, class probabilities, and confidence scores
- **Classes**: 35 waste-specific categories from the TACO dataset

## License

[MIT](LICENSE) 