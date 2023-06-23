import express from 'express';
import AppController from '../controllers/AppController';

const routes = express.Router();

// GET routes
routes.get('/status', AppController.getstatus);
routes.get('/stats', AppController.getstats);

export default routes;
