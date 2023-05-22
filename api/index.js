const express = require('express');
const apiRouter = express.Router();
//const apiRouter = require('express').Router ??

const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);

    // const recoveredData = jwt.verify(token, JWT_SECRET);
    // req.user(recoveredData);
  }

  next();
});

//set `req.user`
apiRouter.use(async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorizaiton token must start with ${ prefix }`
    });
  }
});



// apiRouter.use((req, res, next) => {
//   console.log("Hello! you landed on /api");

//   res.send({
//     message: "/api -> nothing to display here"
//   })
// });

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);

const tagsRouter = require('./tags');
apiRouter.use('/tags', tagsRouter);



apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message
  });
});

module.exports = apiRouter;
