import React, { useState } from "react";
import { Send, MessageSquare, Users } from "lucide-react";
import { MessagingResult } from "../../types/attendance";

/* Mock function to send bulk messages */
async function mockSendBulkMessages(message: string, studentIds: string[]): Promise<MessagingResult> {
  await new Promise(r => setTimeout(r, 1000));
  return {
    success: true,
    total_sent: studentIds.length,
    total_failed: 0,
    message: `Messages sent successfully to ${studentIds.length} students`
  };
}

/* Mock function to get absent students from recent reports */
async function mockGetAbsentStudents(): Promise<{ id: string; name: string; roll: string; class: string }[]> {
  await new Promise(r => setTimeout(r, 300));
  return [
    { id: 's1', name: 'John Doe', roll: 'R001', class: 'CS201' },
    { id: 's2', name: 'Jane Smith', roll: 'R002', class: 'CS201' },
    { id: 's3', name: 'Bob Johnson', roll: 'R003', class: 'CS301' },
    { id: 's4', name: 'Alice Brown', roll: 'R004', class: 'CS301' },
    { id: 's5', name: 'Charlie Wilson', roll: 'R005', class: 'CS201' },
  ];
}

export default function MessagingSystem() {
  const [message, setMessage] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [absentStudents, setAbsentStudents] = useState<{ id: string; name: string; roll: string; class: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [messagingResult, setMessagingResult] = useState<MessagingResult | null>(null);

  React.useEffect(() => {
    loadAbsentStudents();
  }, []);

  const loadAbsentStudents = async () => {
    try {
      const students = await mockGetAbsentStudents();
      setAbsentStudents(students);
    } catch (error) {
      console.error("Failed to load absent students:", error);
    }
  };

  const handleSendMessages = async () => {
    if (!message.trim() || selectedStudents.length === 0) {
      alert('Please enter a message and select at least one student');
      return;
    }

    setLoading(true);
    try {
      const result = await mockSendBulkMessages(message, selectedStudents);
      setMessagingResult(result);
      setMessage('');
      setSelectedStudents([]);
    } catch (error) {
      console.error("Failed to send messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === absentStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(absentStudents.map(s => s.id));
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Messaging System</h1>
          <div className="text-sm text-slate-500 mt-1">Send notifications to absent students</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Composer */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Compose Message
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message to absent students..."
                className="w-full px-3 py-2 border rounded-md resize-none"
                rows={6}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">
                {selectedStudents.length} student(s) selected
              </div>
              <button
                onClick={handleSendMessages}
                disabled={loading || !message.trim() || selectedStudents.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send Messages'}
              </button>
            </div>
          </div>
        </div>

        {/* Student Selector */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Absent Students
            </h2>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {selectedStudents.length === absentStudents.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {absentStudents.map((student) => (
              <div
                key={student.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  selectedStudents.includes(student.id)
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => handleStudentToggle(student.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentToggle(student.id)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{student.name}</div>
                  <div className="text-sm text-slate-500">
                    {student.roll} • {student.class}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messaging Result Modal */}
      {messagingResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Messaging Result</h2>
            <div className="space-y-3">
              <div><strong>Status:</strong> {messagingResult.success ? 'Success' : 'Failed'}</div>
              <div><strong>Messages Sent:</strong> {messagingResult.total_sent}</div>
              <div><strong>Failed:</strong> {messagingResult.total_failed}</div>
              <div><strong>Message:</strong> {messagingResult.message}</div>
            </div>
            <button
              onClick={() => setMessagingResult(null)}
              className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
