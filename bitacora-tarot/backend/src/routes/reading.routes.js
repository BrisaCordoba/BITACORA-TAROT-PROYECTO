import { Router } from 'express';
import { ReadingRepository } from '../repositories/reading.repository.js';
import { ReadingService } from '../services/reading.service.js';
import { ReadingController } from '../controllers/reading.controller.js';

const router = Router();

const repository = new ReadingRepository();
const service = new ReadingService(repository);
const controller = new ReadingController(service);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.patch('/:id/favorite', controller.toggleFavorite);
router.delete('/:id', controller.delete);

export default router;