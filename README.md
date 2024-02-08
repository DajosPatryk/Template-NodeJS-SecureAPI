# Example Restful-API in Node.js
This is an example API server developed to showcase my skills in Node.js backend 🌱<br/>
I kept env variables on GitHub for testing purposes.

## Technology used
- Express.js framework
- Cors
- Morgan development environment logger
- Winston file-logger
- Json-Web-Token signatures
- bcrypt hashing
- Express-Rate-Limit protection
- Prisma ORM **+ Prevents all injections**
- MongoDB Atlas cloud database based in Frankfurt
- Jest unit testing & TS-Jest
- Jest-Mock-Extended
- Swagger API documentation

## Features
- **Basic security features** - Cors, Data sanitizing, injection prevention, rate-limiting, vague error responses and extensive logging for monitoring purposes.
- **Basic Authorization** - Register and Sign-In with basic validation, based on JWT.
- **Cryptography** - Working with JWT-HS512, and bcrypt with 10 salt rounds. 
- **User** - Get operation with mapping.
- **Team** - CRUD operations with basic validation and mapping. Specific team requests also return team members.
- **Team Join-Requests** - Get, Create, Accept and Delete operations with basic validation and mapping.
- **Jest testing** - Jest unit tests covering 90% of the app.
- **Swagger documentation** - Swagger documentation ready for testing.
- **Heroku-Ready configuration** - Configured Heroku-ready Procfile.
- **Pipeline configuration** - Configured GitHub-ready pipeline.
- **Docker configuration** - Configured Docker-ready Dockerfile.

## How to run
- npm i
- npm build
- npm start
#### **OR**
- docker build -t example-restfulapi-nodejs .
- docker run -p 3000:3000 example-restfulapi-nodejs

## How to test
- npm test

## Documentation
- Swagger documentation works on run http://localhost:3000/api/documentation/
- Register 👉 sign-in 👉 then authorize with format: "Bearer {token}"

## What could be improved
- **Response time** - Response time averages at 90ms on my local machine. This is acceptable. I would instead opt for a local database instance to make this faster.
- **Save user ranks to database** - If the database was big, simply running through the entire user list determining ranks would cause performance issues.
- **Error classes** - I kept it basic. Instead of an Error Factory, I'd define custom error classes extending error, those would also not log automatically. Like so: https://www.toptal.com/nodejs/node-js-error-handling
- **More precise handling of internal errors** - I kept it basic, all internal errors are 500, this is not best-practice.
- **Error handling middleware** - Instead of handling errors locally, I would use a centralized error-handling middleware in Express.
- **Expand authorization** - I kept it basic. I would add email validation, password resets, MFA, OAuth and expand on data validation.
- **Check for vulnerabilities** - Although Node.js shows **0 vulnerabilities**, I would check and replace or fix libraries that have vulnerabilities: https://vuldb.com
- **Setup better logging middleware** - I kept logging basic, for better monitoring I would expand it and add rounds.
- **Opt for contexts for database mocking** - I kept it basic. I would create contexts for the database instead of using a singleton.
- **Introduce integration tests** - For further testing.
- **Controllers act as services** - I would rearrange the structure and add a services directory. As this is a small project, I did not bother.
- **No SSL implementation** - I did not add SSL because this is usually handled by hosting services.