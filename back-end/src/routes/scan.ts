import { Router } from 'express';
import { ScanController } from '../controllers/ScanController';

const router = Router();
const scanController = new ScanController();

router.post('/scan', scanController.scan);

export default router;
