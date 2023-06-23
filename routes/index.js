import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';

const routes = express.Router();

// GET routes
routes.get('/status', AppController.getstatus);
routes.get('/stats', AppController.getstats);

// POST routes
routes.post('/users', UsersController.postNew);

export default routes;
