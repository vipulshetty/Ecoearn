import WasteImageUpload from '@/components/WasteImageUpload';

export default function WasteAnalysisPage() {
  return (
    <div className="container mx-auto py-8 pt-24">
      <h1 className="text-2xl font-bold mb-6 text-center">Waste Analysis</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto">
        Upload an image of waste to analyze it using our YOLOv5-powered detection system. 
        Earn points for recycling and help the environment!
      </p>
      <WasteImageUpload />
    </div>
  );
}