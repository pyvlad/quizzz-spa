from django.core.management.base import BaseCommand
from quizzz.common.devdata import loaddata


class Command(BaseCommand):
    help = 'Fills development database with some data.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Loading some data into development DB...'))
        
        loaddata()

        self.stdout.write(self.style.SUCCESS('Successfully loaded development data'))