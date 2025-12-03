import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';

export default function DashboardView() {
  const stats = [
    { label: 'Total Users', value: 1250, icon: Users, color: 'bg-blue-500', lightColor: 'bg-blue-50' },
    { label: 'Total Courses', value: 48, icon: BookOpen, color: 'bg-purple-600', lightColor: 'bg-purple-50' },
    { label: 'Active Enrollments', value: 3840, icon: TrendingUp, color: 'bg-green-500', lightColor: 'bg-green-50' },
    { label: 'Completion Rate', value: '78%', icon: Award, color: 'bg-orange-500', lightColor: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening with your platform today.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`{stat.lightColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
