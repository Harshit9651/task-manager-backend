import { Router } from 'express';
import { boardController } from '@/controllers/board.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  boardIdValidator,
  createBoardValidator,
  updateBoardValidator,
} from '@/validators/board.validator';

const router = Router();
router.use(authenticate);

router.post('/', validate(createBoardValidator), boardController.create);
router.get('/', boardController.list);
router.get('/:id', validate(boardIdValidator), boardController.getById);
router.patch('/:id', validate([...boardIdValidator, ...updateBoardValidator]), boardController.update);
router.delete('/:id', validate(boardIdValidator), boardController.remove);

export default router;