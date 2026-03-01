import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Person C — student experience
import LoginPage from './pages/LoginPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';

// Person D — teacher experience
import TeacherPage from './pages/TeacherPage';
import TeacherStudentPage from './pages/TeacherStudentPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Person C routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/quiz/:studentId" element={<QuizPage />} />
        <Route path="/dashboard/:studentId" element={<DashboardPage />} />

        {/* Person D routes */}
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/teacher/:studentId" element={<TeacherStudentPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
