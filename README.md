# Example Restful-API in Node.js
This is a basic template/example for a restful API server developed in Node.js backend 🌱<br/>
I kept env variables and secrets on GitHub for testing purposes 📐✏️👷‍♀️<br/>

## Technology used
- **Express.js** - framework
- **Cors**
- **Morgan** - development environment logger
- **Winston** - file-logger
- **Json-Web-Token** - signatures
- **bcrypt** - hashing
- **Express-Rate-Limit** - protection
- **Prisma ORM** - **lightweight mapper that prevents all injections**
- **MongoDB Atlas** - cloud database based in Frankfurt
- **Jest unit testing** & **TS-Jest**
- **Jest-Mock-Extended**
- **Swagger** - Live documentation

## Features
- **Basic security features** - JWT-HS512, bcrypt with 10 salt rounds for passwords, Cors, Data sanitizing, injection prevention, rate-limiting, vague error responses and extensive logging for monitoring purposes.
- **Basic Authorization** - Register and Sign-In with basic validation, based on JWT.
- **User** - Get operation with mapping.
- **Team** - CRUD operations with basic validation and mapping. Specific team requests also return team members.
- **Team Join-Requests** - Get, Create, Accept and Delete operations with basic validation and mapping.
- **Jest testing** - Jest unit tests covering ~90% of the app.
- **Swagger documentation** - Swagger documentation ready for testing.
- **Heroku-Ready configuration** - Configured a basic Heroku-ready Procfile.
- **Pipeline configuration** - Configured a basic GitHub-ready pipeline for testing.
- **Docker configuration** - Configured basic Docker-ready files.

## How to run
- cd ./server
- npm i
- npm build
- npm start
#### **OR**
- cd ./server
- docker-compose build --no-cache
- docker-compose up -d

## How to test
- npm test

## Documentation
- Swagger documentation works on run: http://localhost:3000/api/documentation/
- Register 👉 sign-in 👉 then authorize with format: "Bearer {token}"

## What could be improved
- **Response time** - Response time averages at 100ms on my local machine. This is acceptable. I would instead opt for a local database instance to make this faster.
- **Optimal response times** - In order to achieve optimal response times, I would use a minifier for prod, eliminate Prisma altogether.
- **Superfast performance** - In order to push the limits of JavaScript, I would opt for **Bun** instead of Node.js and Redis instead of MongoDB.
- **Save user ranks to database** - If the database was big, simply running through the entire user list determining ranks would cause performance issues.
- **Error classes** - I kept it basic. Instead of an Error Factory, I'd define custom error classes extending error, those would also not log automatically. Like so: https://www.toptal.com/nodejs/node-js-error-handling
- **More precise handling of internal errors** - I kept it basic, all internal errors are 500, this is not best-practice.
- **Expand authorization** - I kept it basic. I would add token-cookies, email validation, password resets, MFA, OAuth and expand on data validation.
- **Setup better logging middleware** - I kept logging basic, for better monitoring I would expand it and add rounds.
- **Opt for contexts for database mocking** - I kept it basic. I would create contexts for the database instead of using a singleton.
- **Introduce integration tests** - For further testing.
- **Controllers act as services** - I would rearrange the structure and add a services directory. As this is a small project, I did not bother.
- **Automatic Swagger generation** - I would find or build a library to automatically build Swagger json files.
- **Check for vulnerabilities** - Although Node.js shows **0 vulnerabilities**, I would check and replace or fix libraries that have vulnerabilities: https://vuldb.com
- **No SSL implementation** - I did not add SSL because this is usually handled by hosting services like Heroku or Netlify.
