# Generated by Django 3.2 on 2021-07-19 11:47

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('tournaments', '0001_initial'),
        ('quizzes', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Play',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_submitted', models.BooleanField(default=False)),
                ('result', models.IntegerField(blank=True, null=True)),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('finish_time', models.DateTimeField(blank=True, null=True)),
                ('client_start_time', models.DateTimeField(blank=True, null=True)),
                ('client_finish_time', models.DateTimeField(blank=True, null=True)),
                ('round', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='plays', to='tournaments.round')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'plays',
                'unique_together': {('user', 'round')},
            },
        ),
        migrations.CreateModel(
            name='PlayAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('option', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='quizzes.option')),
                ('play', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='plays.play')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='quizzes.question')),
            ],
            options={
                'db_table': 'play_answers',
            },
        ),
    ]
