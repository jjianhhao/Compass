import { useParams } from 'react-router-dom';
import StudentDetail from '../components/teacher/StudentDetail';

export default function TeacherStudentPage() {
  const { studentId } = useParams();
  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 to-teal-50/40">
      <StudentDetail studentId={studentId} />
    </div>
  );
}
