/**
 * Mock mobile scan API endpoint
 * In production, this would be a serverless function or Express route
 * that receives scan data from the mobile app
 */

import { handleMobileScan } from './attendanceService';

/**
 * Simulate mobile scan POST endpoint
 * Mobile app would POST to: /api/attendance/scan
 * Body: { register_no: string, name?: string, class_no: string }
 */
export async function simulateMobileScan(payload: {
  register_no: string;
  name?: string;
  class_no: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    await handleMobileScan(payload);
    return {
      success: true,
      message: `Attendance marked for ${payload.register_no}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to mark attendance',
    };
  }
}

/**
 * Test function to simulate a student scanning the QR code
 * You can call this from browser console for testing:
 * 
 * import { testScan } from './lib/mobileScanAPI';
 * testScan('REG001', 'John Doe', 'CS-2A');
 */
export async function testScan(
  registerNo: string,
  name: string,
  classNo: string
): Promise<void> {
  const result = await simulateMobileScan({
    register_no: registerNo,
    name,
    class_no: classNo,
  });
  console.log('Scan result:', result);
}
