import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminPortal from "./pages/AdminPortal";
import HodPortal from "./pages/HodPortal";
import FacultyPortal from "./pages/FacultyPortal";
import RedirectToRole from "./components/RedirectToRole";
import LoginForm from "./components/Auth/LoginForm";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RedirectToRole />
        <Routes>
          <Route path="/" element={<RedirectToRole />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/admin/*" element={<AdminPortal />} />
          <Route path="/hod/*" element={<HodPortal />} />
          <Route path="/faculty/*" element={<FacultyPortal />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
