import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/quiz/:studentId" element={<QuizPage />} />
        <Route path="/dashboard/:studentId" element={<DashboardPage />} />
        <Route
          path="/teacher"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-700 mb-2">Teacher Dashboard</h1>
                <p className="text-gray-400">Coming soon — Person D's feature</p>
              </div>
            </div>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
