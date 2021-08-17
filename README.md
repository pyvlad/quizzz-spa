# Quizzz Web App 

# Project Description

Quizzz is a web application where users can participate in quiz competitions 
with people that they know.

[LIVE VERSION](https://quizzz.su)

This is a hobby/study project where I wanted to combine in a single project multiple technologies that I've learned in recent months and years.

This version of the application is written as a Single-Page Application (SPA) using the following technologies and assumptions:
1. Frontend:
    - Create-React-App as frontend toolchain
    - React-Redux for global state management
    - React Router for navigation
    - Custom CSS with Sass (mostly copied from the previous version - no CSS framework used)
2. Backend:
    - Django REST Framework for backend API
3. Deployment:
    - Ansible playbook for an automated single-server deployment (with Nginx, Gunicorn, Postgresql, Postfix, Memcached); 
    - 2 environments are assumed: production (Ubuntu VPS) and staging (Ubuntu Vagrant VM).

The [original version](https://github.com/pyvlad/quizzz) was written as a classical monolith application with Flask & Sqlalchemy on the backend, custom CSS built with Sass, some simple plain Javascript functionality added here and there, and the Ansible playbook for a one-server deployment.


# Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Docs for [Create React App](https://create-react-app.dev/docs/getting-started).

In short, Create React App is an officially supported way to create *single-page* React applications.

## Useful Frontend Commands

### `$ npm start`
### `$ npm test`
### `$ npm run build`

## Frontend Notes

- 'jsconfig.json' is needed for absolute imports - see [details](https://create-react-app.dev/docs/importing-a-component/#absolute-imports). This feature was introduced in CRA3 and replaced the use of $NODE_PATH environment variable - see [create-react-app/packages/react-scripts/config/modules.js] (https://github.com/facebook/create-react-app/blob/4b8b38bf7c55326f8d51ea9deeea76d7feee307d/packages/react-scripts/config/modules.js#L21).


# Backend 

Backend is developed with Django REST Framework at './drf'.

## Useful backend commands

Define `drf_venv` in an `.npmrc` file (as a path to the /bin directory 
of the respective virtual environment) and run API during development:
### `$ npm run drf` 

Run migrations and fill tables with fixtures data:
### `$ npm run drf-db`

Run tests and calculate test coverage:
### `$ npm run drf-coverage`


# Deployment

One-server deployment is configured with Ansible at './deploy'.

Two environments are assumed:
1. Staging environment (local `vagrant` machine defined at `./deploy/Vagrantfile`)
2. Production environment (`production_server` machine)

To configure production, the following files must be added (they are kept of out of source control): 
- `./deploy/ansible/envs/production/host_vars/production_server.yml` with at least `ansible_host` and `ansible_user`;
- `./deploy/ansible/envs/production/files/.secrets.json` with `SECRET_KEY` and `DOMAIN`.

## Useful deployment commands

### `$ npm run deploy-staging` 
### `$ npm run deploy-production`