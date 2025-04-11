const express = require('express');
const app = express();
app.use(express.json());
const usersRouter = require('./users');
app.use('/api', usersRouter);
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
