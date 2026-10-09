import { Router } from 'express';

export function createContactAdminRoutes({ authenticate, controller }) {
  const router = Router();
  router.use(authenticate);
  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.read);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
