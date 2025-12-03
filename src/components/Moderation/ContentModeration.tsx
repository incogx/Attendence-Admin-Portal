import { Shield } from 'lucide-react';

export default function ContentModeration() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Content Moderation</h2>
          <p className="text-gray-600">Review and moderate user-submitted content</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <Shield className="w-8 h-8 text-purple-600" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500 text-center py-8">Content moderation interface</p>
      </div>
    </div>
  );
}
