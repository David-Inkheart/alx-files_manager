import express from 'express';

import routes from './routes/index';

const app = express();

const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());

// routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
