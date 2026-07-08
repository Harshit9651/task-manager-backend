import { Router } from 'express';
import { clientController } from '@/controllers/client.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import { uploadClientFile } from '@/middleware/upload';
import {
  clientIdValidator, updateClientValidator, onboardingValidator,
  createInvoiceValidator, invoiceStatusValidator, invoiceIdValidator,
  documentIdValidator, uploadDocumentValidator,
} from '@/validators/client.validator';

const router = Router();
router.use(authenticate);

router.get('/', clientController.list);
router.get('/:id', validate(clientIdValidator), clientController.getById);
router.patch('/:id', validate([...clientIdValidator, ...updateClientValidator]), clientController.update);

router.patch('/:id/onboarding', validate([...clientIdValidator, ...onboardingValidator]), clientController.toggleOnboarding);

router.post('/:id/invoices', validate([...clientIdValidator, ...createInvoiceValidator]), clientController.addInvoice);
router.patch('/:id/invoices/:invId', validate([...clientIdValidator, ...invoiceIdValidator, ...invoiceStatusValidator]), clientController.updateInvoiceStatus);
router.delete('/:id/invoices/:invId', validate([...clientIdValidator, ...invoiceIdValidator]), clientController.deleteInvoice);


router.post('/:id/documents', validate(clientIdValidator), uploadClientFile, validate(uploadDocumentValidator), clientController.uploadDocument);
router.delete('/:id/documents/:docId', validate([...clientIdValidator, ...documentIdValidator]), clientController.deleteDocument);

export default router;