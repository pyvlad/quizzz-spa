import datetime
from django.utils import timezone

from quizzz.users.models import CustomUser
from quizzz.communities.models import Community
from quizzz.chat.models import ChatMessage
from quizzz.quizzes.models import Quiz, Question, Option
from quizzz.tournaments.models import Tournament, Round


NOW = timezone.now()
NOW = NOW.replace(second=0, microsecond=0)


def loaddata():
    create_users()
    create_communities()
    create_chat()
    create_quizzes()
    create_tournament()
    create_round()


def create_users():
    """
    Create 4 users: "admin" (superuser), "bob", "alice", "ben".
    """
    for user in [
        {
            "username": "admin", 
            "password": "qwerty123", 
            "email": "admin@localhost",
            "is_email_confirmed": True,
            "is_superuser": True
        },
        {
            "username": "bob", 
            "password": "dog12345",
            "email": "bob@example.com",
            "is_email_confirmed": True,
        },
        {
            "username": "alice", 
            "password": "cat12345",
            "email": "alice@example.com",
            "is_email_confirmed": True,
        },
        {
            "username": "ben", 
            "password": "frog12345",
            "email": "ben@example.com",
            "is_email_confirmed": True,
        },
    ]:
        CustomUser.objects.create_user(**user)


def create_communities():
    """
    Create 3 communities:
    - "Group #1" (by "bob") has "alice" as another member, and a password to join;
    - "Group #2" (by "alice") does not need a password to join but requires approval;    
    - "Group #3" (by "bob") requires neither password not approval, but accepts only 2 members.
    """
    bob = CustomUser.objects.get(username="bob")
    alice = CustomUser.objects.get(username="alice")

    group1 = {
        "name": "Group #1",
        "password": "secret",
        "approval_required": False,
        "max_members": 10,
    }
    membership = Community.create(bob, **group1)
    membership.community.join(alice)

    group2 = {
        "name": "Group #2",
        "password": "",
        "approval_required": True,
        "max_members": 10,
    }
    Community.create(alice, **group2)

    group3 = {
        "name": "Group #3",
        "password": "",
        "approval_required": False,
        "max_members": 2,
    }
    Community.create(bob, **group3)



def create_chat():
    """
    Create some messages in chat of "Group #1".
    """
    group1 = Community.objects.get(name="Group #1")
    bob = CustomUser.objects.get(username="bob")
    alice = CustomUser.objects.get(username="alice")

    for user, time_created, text in [
        (bob, NOW - datetime.timedelta(days=2), "Hello, world! Bob here."),
        (alice, NOW - datetime.timedelta(hours=1), "Hello, Bob! I'm Alice."),
        (bob, NOW - datetime.timedelta(minutes=30), "Hello, Alice! Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."),
        (alice, NOW, "That's fascinating, Bob. Take care."),
    ]:
        ChatMessage.objects.create(
            text=text,
            user=user,
            community=group1,
            time_created=time_created
        )



def create_quizzes():
    """
    Create some quizzes from "bob" (first 3) and "alice" (Song Definitions) for "Group #1".
    """
    group1 = Community.objects.get(name="Group #1")
    bob = CustomUser.objects.get(username="bob")
    alice = CustomUser.objects.get(username="alice")

    def add_questions(quiz_obj, questions):
        for question in questions:
            question_obj = Question.objects.create(
                text=question["text"], 
                explanation=question["explanation"],
                quiz=quiz_obj,
            )
            for text, is_correct in question["options"]:
                Option.objects.create(
                    text=text, 
                    is_correct=is_correct, 
                    question=question_obj
                )

    quiz1 = Quiz.objects.create(
        name="Mixed Bag",
        description="Just a couple questions about counting and sounds.",
        introduction="",
        is_finalized=True,
        num_questions=2,
        num_options=4,
        user=bob,
        community=group1,
        time_created=NOW-datetime.timedelta(hours=10),
    )
    add_questions(quiz1, [
        {
            "text": "What does 2+2 equal to?",
            "explanation": "That's a toughie. But you can verify the answer with your fingers.",
            "options": [
                ("1", False),
                ("2", False),
                ("3", False),
                ("4", True),
            ]
        },
        {
            "text": "What does the fox say?",
            "explanation": "Try searching the answer on youtube.",
            "options": [
                ("Meaow", False),
                ("Woof", False),
                ("Bazinga!", False),
                ("None of these", True),
            ]
        }
    ])


    quiz2 = Quiz.objects.create(
        name="Cities",
        description="How well do you know Russian cities?",
        introduction="",
        is_finalized=True,
        num_questions=2,
        num_options=4,
        user=bob,
        community=group1,
        time_created=NOW-datetime.timedelta(hours=9),
    )
    add_questions(quiz2, [
        {
            "text": "What city is officially the capital of Russia?",
            "explanation": "",
            "options": [
                ("Kiev", False),
                ("Moscow", True),
                ("Russianberg", False),
                ("Saint Petersburg", False),
            ]
        },
        {
            "text": "What city never was a capital of Russia?",
            "explanation": "",
            "options": [
                ("Moscow", False),
                ("Kiev", False),
                ("Novosibirsk", True),
                ("Novgorod", False),
            ]
        }
    ])


    quiz3 = Quiz.objects.create(
        name="Programming",
        description="Just a couple questions about counting and sounds.",
        introduction="",
        is_finalized=True,
        num_questions=2,
        num_options=4,
        user=bob,
        community=group1,
        time_created=NOW-datetime.timedelta(hours=8),
    )
    add_questions(quiz3, [
        {
            "text": "Which of these is a programming language?",
            "explanation": "",
            "options": [
                ("Python", True),
                ("Anaconda", False),
                ("HTML", False),
                ("CSS", False),
            ]
        },
        {
            "text": "Which famous programmer didn't participate in the development of UNIX at Belle Labs?",
            "explanation": "",
            "options": [
                ("Ken Thompson", False),
                ("Dennis Ritchie", False),
                ("Douglas McIlroy", False),
                ("Guido van Rossum", True),
            ]
        }
    ])


    quiz4 = Quiz.objects.create(
        name="Song Questions",
        description="How do famous songs answer important questions?",
        introduction="Provide the most complete answer.",
        is_finalized=True,
        num_questions=2,
        num_options=4,
        user=alice,
        community=group1,
        time_created=NOW-datetime.timedelta(hours=7),
    )
    add_questions(quiz4, [
        {
            "text": "What is love?",
            "explanation": "",
            "options": [
                ("baby don't hurt me", False),
                ("don't hurt me", False),
                ("no more", False),
                ("all of these", True),
            ]
        },
        {
            "text": "How much is the fish?",
            "explanation": "",
            "options": [
                ("lala-lalala-la-la", False),
                ("lalalala", False),
                ("lala-lalala-la-lalala", False),
                ("all of these", True),
            ]
        }
    ])


def create_tournament():
    group1 = Community.objects.get(name="Group #1")

    Tournament.objects.create(**{
        "name": "First Competition",
        "is_active": True,
    }, community=group1)


def create_round():
    tournament = Tournament.objects.get(name="First Competition")
    quiz = Quiz.objects.get(name="Mixed Bag")
    
    Round.objects.create(**{
        "start_time": NOW,
        "finish_time": NOW + datetime.timedelta(minutes=60),
    }, quiz=quiz, tournament=tournament)