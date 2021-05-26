# set up dev DB

${DRF_VENV}/python manage.py migrate;
${DRF_VENV}/python manage.py loaddata quizzz/users/fixtures/users.json;
${DRF_VENV}/python manage.py loaddata quizzz/communities/fixtures/communities.json;
${DRF_VENV}/python manage.py loaddata quizzz/chat/fixtures/chat.json;