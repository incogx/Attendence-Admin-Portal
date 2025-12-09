import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Users, Calendar, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PendingApproval {
  session_id: string;
  status: string;
  comment: string | null;
  updated_at: string;
  session: {
    id: string;
    class_no: string;
    faculty_name: string;
    department: string;
    session_date: string;
    started_at: string;
    ended_at: string;
  };
}

interface AttendanceMark {
  register_no: string;
  student_name: string | null;
  status: 'PRESENT' | 'ABSENT';
  marked_at: string;
}

export default function HodApprovals() {
  const { profile } = useAuth() as any;
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [marks, setMarks] = useState<AttendanceMark[]>([]);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionMarks(selectedSession);
    }
  }, [selectedSession]);

  async function fetchPendingApprovals() {
    setLoading(true);
    setError(null);

    try {
      // Fetch pending approvals with session details
      const { data, error } = await supabase
        .from('attendance_approvals')
        .select(`
          session_id,
          status,
          comment,
          updated_at,
          attendance_sessions!inner (
            id,
            class_no,
            faculty_name,
            department,
            session_date,
            started_at,
            ended_at
          )
        `)
        .eq('status', 'PENDING')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform nested data
      const transformed = (data || []).map((item: any) => ({
        session_id: item.session_id,
        status: item.status,
        comment: item.comment,
        updated_at: item.updated_at,
        session: item.attendance_sessions,
      }));

      setApprovals(transformed);
    } catch (err: any) {
      console.error('Failed to fetch approvals:', err);
      setError(err.message || 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSessionMarks(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('attendance_marks')
        .select('register_no, student_name, status, marked_at')
        .eq('session_id', sessionId)
        .order('status', { ascending: false }); // PRESENT first

      if (error) throw error;
      setMarks(data || []);
    } catch (err: any) {
      console.error('Failed to fetch marks:', err);
      setError(err.message || 'Failed to load attendance marks');
    }
  }

  async function handleApprove(sessionId: string) {
    const confirmed = window.confirm('Approve this attendance session?');
    if (!confirmed) return;

    setActionLoading(true);
    setError(null);

    try {
      // Update approval status
      const { error: approvalError } = await supabase
        .from('attendance_approvals')
        .update({
          status: 'APPROVED',
          comment: comment.trim() || null,
          hod_id: profile?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (approvalError) throw approvalError;

      // Update session status
      const { error: sessionError } = await supabase
        .from('attendance_sessions')
        .update({ status: 'APPROVED' })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      alert('Attendance approved successfully!');
      setComment('');
      setSelectedSession(null);
      await fetchPendingApprovals();
    } catch (err: any) {
      console.error('Failed to approve:', err);
      setError(err.message || 'Failed to approve attendance');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(sessionId: string) {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection in the comment box.');
      return;
    }

    const confirmed = window.confirm('Reject this attendance session?');
    if (!confirmed) return;

    setActionLoading(true);
    setError(null);

    try {
      // Update approval status
      const { error: approvalError } = await supabase
        .from('attendance_approvals')
        .update({
          status: 'REJECTED',
          comment: comment.trim(),
          hod_id: profile?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);

      if (approvalError) throw approvalError;

      // Update session status
      const { error: sessionError } = await supabase
        .from('attendance_sessions')
        .update({ status: 'REJECTED' })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      alert('Attendance rejected.');
      setComment('');
      setSelectedSession(null);
      await fetchPendingApprovals();
    } catch (err: any) {
      console.error('Failed to reject:', err);
      setError(err.message || 'Failed to reject attendance');
    } finally {
      setActionLoading(false);
    }
  }

  const selectedApproval = approvals.find((a) => a.session_id === selectedSession);
  const presentCount = marks.filter((m) => m.status === 'PRESENT').length;
  const absentCount = marks.filter((m) => m.status === 'ABSENT').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Approvals</h1>
        <p className="text-gray-600">Review and approve faculty attendance submissions</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Approvals List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Pending Approvals ({approvals.length})
            </h2>

            {loading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : approvals.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {approvals.map((approval) => (
                  <button
                    key={approval.session_id}
                    onClick={() => setSelectedSession(approval.session_id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedSession === approval.session_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 mb-1">
                      Class {approval.session.class_no}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {approval.session.faculty_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(approval.session.session_date).toLocaleDateString()}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Details & Actions */}
        <div className="lg:col-span-2">
          {!selectedSession ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select an approval from the list to review details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Session Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Class:</span>
                    <span className="ml-2 font-semibold">{selectedApproval?.session.class_no}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Faculty:</span>
                    <span className="ml-2 font-medium">{selectedApproval?.session.faculty_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Department:</span>
                    <span className="ml-2 font-medium">{selectedApproval?.session.department}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedApproval?.session.session_date || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Attendance Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                    <div className="text-sm text-green-600 mt-1">Present</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                    <div className="text-sm text-red-600 mt-1">Absent</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">{marks.length}</div>
                    <div className="text-sm text-blue-600 mt-1">Total</div>
                  </div>
                </div>
              </div>

              {/* Attendance List */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Student Attendance</h3>
                <div className="overflow-auto max-h-[400px]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Register No.</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {marks.map((mark) => (
                        <tr key={mark.register_no} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{mark.register_no}</td>
                          <td className="px-4 py-3">
                            {mark.status === 'PRESENT' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                <CheckCircle className="w-3 h-3" />
                                Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                                <XCircle className="w-3 h-3" />
                                Absent
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            {new Date(mark.marked_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Comment & Actions */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comment (optional for approval, required for rejection)
                </h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment or feedback..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleApprove(selectedSession)}
                    disabled={actionLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedSession)}
                    disabled={actionLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    <XCircle className="w-5 h-5" />
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
