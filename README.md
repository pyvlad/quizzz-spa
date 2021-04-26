# Quizzz App 

# Project Description

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
Docs for [Create React App](https://create-react-app.dev/docs/getting-started).

In short, Create React App is an officially supported way to create *single-page* React applications.

## Useful Commands

### `$ npm start`
### `$ npm test`
### `$ npm run build`

# Backend 

There are two backends developed in parallel for study purposes:
1. Flask-based backend (located at './api');
2. Django-Rest-Framework-based backend (located at './drf').

Run one backend at a time via `$ npm run api` or `$ npm run drf` from another terminal.
To run these commands, define `api_venv` and `drf_venv` in an `.nrpmc` file (as paths to the /bin directories of the respective virtual environments).

# Frontend

- 'jsconfig.json' is needed for absolute imports - see [details](https://create-react-app.dev/docs/importing-a-component/#absolute-imports). This feature was introduced in CRA3 and replaced the use of $NODE_PATH environment variable - see [create-react-app/packages/react-scripts/config/modules.js] (https://github.com/facebook/create-react-app/blob/4b8b38bf7c55326f8d51ea9deeea76d7feee307d/packages/react-scripts/config/modules.js#L21).