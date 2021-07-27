import os
from django.core import management
from django.core.management.base import BaseCommand
from django.core.management.commands import loaddata


class Command(BaseCommand):
    help = 'Fills development database with some data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Loading fixtures...'))
        for fixture in [
            "users.json",
            "communities.json",
            "chat.json",
            "quizzes.json",
        ]:
            management.call_command(
                loaddata.Command(),     # or just 'loaddata'
                os.path.join("quizzz/common/fixtures/", fixture), 
                verbosity=0
            )
            self.stdout.write(self.style.SUCCESS(f'...{fixture}'))

        self.stdout.write(self.style.SUCCESS('Successfully loaded development data'))