from quizzz.users.tests.data import USERS
from quizzz.communities.tests.data import COMMUNITIES


QUIZZES = {
    "quiz1": {
        "id": 1,
        "name": "Quiz One",
        "description": "Just a couple easy questions for testing.",
        "introduction": "Just pick the right answer! No googling!",
        "num_questions": 2,
        "num_options": 2,
        "is_finalized": False,
        "user_id": USERS["bob"]["id"],
        "community_id": COMMUNITIES["group1"]["id"]
    }
}


QUIZ_QUESTIONS = {
    "question1": {
        "id": 1,
        "quiz_id": QUIZZES["quiz1"]["id"],
        "text": "What does 2+2 equal to?",
        "explanation": "That's a toughie. But you can verify the answer with your fingers."
    },
    "question2": {
        "id": 2,
        "quiz_id": QUIZZES["quiz1"]["id"],
        "text": "What does the fox say?",
        "explanation": "Try searching the answer on youtube.",
    }
}


QUESTION_OPTIONS = [
    {"id": 1, "text": "1", "question_id": QUIZ_QUESTIONS["question1"]["id"]},
    {"id": 2, "text": "2", "question_id": QUIZ_QUESTIONS["question1"]["id"]},
    {"id": 3, "text": "3", "question_id": QUIZ_QUESTIONS["question1"]["id"]},
    {"id": 4, "text": "4", "question_id": QUIZ_QUESTIONS["question1"]["id"], "is_correct": True},
    {"id": 5, "text": "Meaow", "question_id": QUIZ_QUESTIONS["question2"]["id"]},
    {"id": 6, "text": "Woof", "question_id": QUIZ_QUESTIONS["question2"]["id"]},
    {"id": 7, "text": "Bazinga!", "question_id": QUIZ_QUESTIONS["question2"]["id"]},
    {"id": 8, "text": "None of these", "question_id": QUIZ_QUESTIONS["question2"]["id"], "is_correct": True}
]