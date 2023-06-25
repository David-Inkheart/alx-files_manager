import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const routes = express.Router();

// GET routes
routes.get('/status', AppController.getstatus);
routes.get('/stats', AppController.getstats);
routes.get('/connect', AuthController.getConnect);
routes.get('/disconnect', AuthController.getDisconnect);
routes.get('/users/me', UsersController.getMe);
routes.get('/files/:id', FilesController.getShow);
routes.get('/files', FilesController.getIndex);
routes.get('/files/:id/data', FilesController.getFile);

// POST routes
routes.post('/users', UsersController.postNew);
routes.post('/files', FilesController.postUpload);

// PUT routes
routes.put('/files/:id/publish', FilesController.putPublish);
routes.put('/files/:id/unpublish', FilesController.putUnpublish);

export default routes;
