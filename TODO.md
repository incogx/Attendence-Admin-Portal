# Faculty Portal Routing Update Plan

## Tasks
- [x] Update FacultyPortal.tsx to use React Router (Routes, Route) instead of conditional rendering
- [x] Create FacultyClasses component for /faculty/classes route (using existing class selection logic)
- [ ] Update FacultyDashboard to support /faculty/today route (with today's classes filter)
- [ ] Ensure FacultySidebar.tsx links work with new routes
- [ ] Test navigation between all routes
- [ ] Verify UI consistency with admin layout

## Routes to Implement
- /faculty -> FacultyDashboard
- /faculty/today -> FacultyDashboard (filtered for today)
- /faculty/classes -> FacultyClasses (new component)
- /faculty/generate-qr -> GenerateQRPanel
- /faculty/attendance -> AttendancePage
- /faculty/notifications -> NotificationCenter
- /faculty/settings -> SettingsView

## Components Used
- FacultyDashboard (existing)
- AttendancePage (existing)
- GenerateQRPanel (existing)
- StudentsGrid (existing)
- FacultyHeader (existing)
- FacultySidebar (existing)
- NotificationCenter (shared)
- SettingsView (shared)
- FacultyClasses (new)
