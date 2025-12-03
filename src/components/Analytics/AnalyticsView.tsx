import { BarChart3 } from 'lucide-react';

export default function AnalyticsView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Track performance and insights across your platform</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <BarChart3 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <p className="text-gray-500 text-center">Analytics dashboard</p>
      </div>
    </div>
  );
}
