/**
 * Attendance service for live QR session management
 */

import { supabase } from './supabase';

export interface Student {
  id: string;
  Register_no: string;
  class: string;  // Note: column is 'class' in student_profiles table
  name?: string;
}

export interface AttendanceMark {
  id: string;
  session_id: string;
  register_no: string;
  student_name: string | null;
  status: 'PRESENT' | 'ABSENT';
  marked_at: string;
}

export interface AttendanceSession {
  id: string;
  class_no: string;
  faculty_id: string;
  faculty_name: string | null;
  department: string | null;
  session_date: string;
  started_at: string;
  ended_at: string | null;
  status: 'ACTIVE' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  qr_token: string | null;
}

/**
 * Start a new attendance session
 */
export async function startAttendanceSession(
  classNo: string,
  facultyId: string,
  facultyName: string,
  department: string
): Promise<AttendanceSession> {
  const qrToken = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const { data, error } = await supabase
    .from('attendance_sessions')
    .insert([
      {
        class_no: classNo,
        faculty_id: facultyId,
        faculty_name: facultyName,
        department: department,
        status: 'ACTIVE',
        qr_token: qrToken,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all students for a class
 */
export async function getClassStudents(classNo: string): Promise<Student[]> {
  console.log('Fetching students for class:', classNo);
  
  const { data, error } = await supabase
    .from('student_profiles')
    .select('id, Register_no, class')
    .ilike('class', classNo.trim());  // Case-insensitive, trimmed

  console.log('Query result:', { data, error, count: data?.length });

  if (error) throw error;
  return data || [];
}

/**
 * Get attendance marks for a session
 */
export async function getSessionMarks(sessionId: string): Promise<AttendanceMark[]> {
  const { data, error } = await supabase
    .from('attendance_marks')
    .select('*')
    .eq('session_id', sessionId)
    .order('marked_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Mark a student present (called from mobile scan or manual)
 */
export async function markStudentPresent(
  sessionId: string,
  classNo: string,
  registerNo: string,
  studentName?: string
): Promise<void> {
  const { error } = await supabase
    .from('attendance_marks')
    .upsert(
      {
        session_id: sessionId,
        class_no: classNo,
        register_no: registerNo,
        student_name: studentName || null,
        status: 'PRESENT',
      },
      { onConflict: 'session_id,register_no' }
    );

  if (error) throw error;
}

/**
 * Submit attendance (marks all unmarked as ABSENT)
 */
export async function submitAttendance(sessionId: string): Promise<void> {
  // Call the stored procedure to mark absents
  const { error: procError } = await supabase.rpc('mark_absent_unmarked', {
    p_session_id: sessionId,
  });

  if (procError) throw procError;

  // Update session status to SUBMITTED
  const { error: updateError } = await supabase
    .from('attendance_sessions')
    .update({ status: 'SUBMITTED', ended_at: new Date().toISOString() })
    .eq('id', sessionId);

  if (updateError) throw updateError;

  // Create approval request for HOD
  const { error: approvalError } = await supabase
    .from('attendance_approvals')
    .upsert(
      {
        session_id: sessionId,
        status: 'PENDING',
      },
      { onConflict: 'session_id' }
    );

  if (approvalError) throw approvalError;
}

/**
 * Get active session for a class (if exists)
 */
export async function getActiveSession(classNo: string): Promise<AttendanceSession | null> {
  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('*')
    .eq('class_no', classNo)
    .eq('status', 'ACTIVE')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Handle mobile scan (webhook/API endpoint would call this)
 * For now, this is a client-side helper
 */
export async function handleMobileScan(payload: {
  register_no: string;
  name?: string;
  class_no: string;
}): Promise<void> {
  // Find active session for this class
  const session = await getActiveSession(payload.class_no);
  if (!session) {
    throw new Error(`No active session for class ${payload.class_no}`);
  }

  // Mark present
  await markStudentPresent(
    session.id,
    payload.class_no,
    payload.register_no,
    payload.name
  );
}
