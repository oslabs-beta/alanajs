import path from 'path';
import express from 'express';
import awsRouter from './routers/awsRouter.js';




const app = express();

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/aws', awsRouter);

// catch-all Error 404
app.use((req, res) => res.status(404).send('<h1> 404 Route Not Found </h1>'));

//Global Error handler
app.use((err, req, res, next) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}... at ${new Date}`);
});

export default app;