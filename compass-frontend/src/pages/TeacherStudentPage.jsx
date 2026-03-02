import { useParams } from 'react-router-dom';
import StudentDetail from '../components/teacher/StudentDetail';

export default function TeacherStudentPage() {
  const { studentId } = useParams();
  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      <StudentDetail studentId={studentId} />
    </div>
  );
}
