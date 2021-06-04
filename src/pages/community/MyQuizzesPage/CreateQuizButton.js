import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import { fetchCreateQuiz } from 'api';
import { selectActiveCommunityId } from 'state/communitySlice';
import FormFieldErrors from 'common/FormFieldErrors';


const CreateQuizButton = ({ handleEditQuiz }) => {
  const communityId = useSelector(selectActiveCommunityId);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { non_field_errors: nonFieldErrors } = errors;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoading) {
      setErrors({});
      setIsLoading(true);
      let success = false;

      let quizId;

      try {
        const newQuiz = await fetchCreateQuiz(communityId, {});
        quizId = newQuiz.id;
        success = true;
      } catch(err) {
        setErrors(err.body ? err.body : {non_field_errors: [err.message]});
      }

      setIsLoading(false);
      if (success) {
        handleEditQuiz(quizId);
      }
    }
  }

  return (
    <div>
      <FormFieldErrors errors={ nonFieldErrors } />
      <button className="btn btn--primary" onClick={ handleSubmit }>
        Create Quiz
      </button>
    </div>
  )
}

export default CreateQuizButton;