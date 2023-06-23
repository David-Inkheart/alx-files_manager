import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const routes = express.Router();

// GET routes
routes.get('/status', AppController.getstatus);
routes.get('/stats', AppController.getstats);
routes.get('/connect', AuthController.getConnect);
routes.get('/disconnect', AuthController.getDisconnect);
routes.get('/users/me', UsersController.getMe);

// POST routes
routes.post('/users', UsersController.postNew);

export default routes;
