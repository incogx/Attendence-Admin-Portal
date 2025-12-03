import { Bell } from 'lucide-react';

export default function NotificationCenter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h2>
          <p className="text-gray-600">Stay updated with important events and messages</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-center">Notification center</p>
      </div>
    </div>
  );
}
