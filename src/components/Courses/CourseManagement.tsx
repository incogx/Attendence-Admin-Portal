import { Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function CourseManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h2>
          <p className="text-gray-600">Create and manage your educational courses</p>
        </div>
        <button className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create Course</span>
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
        </div>
        <p className="text-gray-500 text-center py-8">Course management interface</p>
      </div>
    </div>
  );
}
