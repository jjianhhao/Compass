import { useParams } from 'react-router-dom';
import StudentDetail from '../components/teacher/StudentDetail';

export default function TeacherStudentPage() {
  const { studentId } = useParams();
  return <StudentDetail studentId={studentId} />;
}
