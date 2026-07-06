import { Router } from 'express';
import { taskController } from '@/controllers/task.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  createTaskValidator,
  listTasksValidator,
  statusTaskValidator,
  taskIdValidator,
  updateTaskValidator,
} from '@/validators/task.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTaskValidator), taskController.create);
router.get('/', validate(listTasksValidator), taskController.list);
router.get('/history', validate(listTasksValidator), taskController.history);
router.get('/stats', taskController.stats);

router.get('/:id', validate(taskIdValidator), taskController.getById);
router.patch('/:id', validate([...taskIdValidator, ...updateTaskValidator]), taskController.update);
router.put('/:id', validate([...taskIdValidator, ...updateTaskValidator]), taskController.update);
router.patch('/:id/status', validate([...taskIdValidator, ...statusTaskValidator]), taskController.setStatus);
router.delete('/:id', validate(taskIdValidator), taskController.remove);
router.patch('/:id/restore', validate(taskIdValidator), taskController.restore);

export default router;