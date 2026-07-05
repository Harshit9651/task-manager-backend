import { Router } from 'express';
import { leadController } from '@/controllers/lead.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  createLeadValidator,
  leadIdValidator,
  listLeadsValidator,
  updateLeadValidator,
  updateLeadFollowUpValidator,
  updateLeadStatusValidator
} from '@/validators/lead.validator';

const router = Router();


router.use(authenticate);

router.post('/', validate(createLeadValidator), leadController.create);
router.get('/', validate(listLeadsValidator), leadController.list);
router.get('/stats', leadController.stats);
router.patch('/:id/status',validate([...leadIdValidator, ...updateLeadStatusValidator]),leadController.updateStatus);
router.patch('/:id/follow-up',validate([...leadIdValidator, ...updateLeadFollowUpValidator]),leadController.updateFollowUp);
router.get('/:id', validate(leadIdValidator), leadController.getById);
router.patch('/:id', validate([...leadIdValidator, ...updateLeadValidator]), leadController.update);
router.put('/:id', validate([...leadIdValidator, ...updateLeadValidator]), leadController.update);
router.delete('/:id', validate(leadIdValidator), leadController.remove);
router.patch('/:id/archive', validate(leadIdValidator), leadController.archive);
router.patch('/:id/unarchive', validate(leadIdValidator), leadController.unarchive);
router.patch('/:id/restore', validate(leadIdValidator), leadController.restore);

export default router;