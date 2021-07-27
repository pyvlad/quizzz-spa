from . import USERS, COMMUNITIES

# not quite Quiz, Question, Option ORM objects:
# - "question_data" and "option_data" need to be popped;
# - questions should have "quiz_id"; 
# - options should have "question_id".
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
        "community_id": COMMUNITIES["group1"]["id"],

        "question_data": [
            {
                "id": 1,
                "text": "What does 2+2 equal to?",
                "explanation": "That's a toughie. But you can verify the answer with your fingers.",
            
                "option_data": [
                    {"id": 1, "text": "1"},
                    {"id": 2, "text": "2"},
                    {"id": 3, "text": "3"},
                    {"id": 4, "text": "4", "is_correct": True},
                ]
            },
            {
                "id": 2,
                "text": "What does the fox say?",
                "explanation": "Try searching the answer on youtube.",

                "option_data": [
                    {"id": 5, "text": "Meaow"},
                    {"id": 6, "text": "Woof"},
                    {"id": 7, "text": "Bazinga!"},
                    {"id": 8, "text": "None of these", "is_correct": True}
                ]
            },
        ]
    }
}
