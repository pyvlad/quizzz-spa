"""
Test data facts that can be relied upon:
- there are 4 users: "admin" (superuser), "bob", "alice", "ben".
- there are 3 communities: "group1" (by bob), "group2" (by alice), "group3" (by bob).
- there is one regular membership: "alice" is a member of "group1".
- there are 3 messages in chats: 2 in "group1" with pk=1 and pk=2, and 1 in "group2".
- there is 1 non-finalized quiz by "bob" in "group1" referred as "quiz1".
- there is 1 active tournament in "group1" referred as "tournament1".
- there is 1 ongoing round in "tournament1" with "quiz1" to be played.
"""
from .base import BaseTestUtils
from .users import SetupUsersMixin
from .communities import SetupCommunityDataMixin
from .chat import SetupChatDataMixin
from .quizzes import SetupQuizDataMixin
from .tournaments import SetupTournamentsMixin
from .rounds import SetupRoundsMixin