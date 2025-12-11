import { useParams } from 'react-router-dom';
import CreateExam from './CreateExam';

const EditExam = () => {
  const { id } = useParams();
  
  // Pass the exam ID to CreateExam, which will handle edit mode
  return <CreateExam examId={id} />;
};

export default EditExam;
