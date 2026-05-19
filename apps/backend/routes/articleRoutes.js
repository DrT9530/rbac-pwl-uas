import express from 'express';
import { getAllArticles, createArticle, updateArticle, deleteArticle } from '../controllers/articleController.js';
import { authenticateUser, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/', requirePermission('READ_ARTICLE'), getAllArticles);
router.post('/', requirePermission('CREATE_ARTICLE'), createArticle);
router.put('/:id', requirePermission('UPDATE_ARTICLE'), updateArticle);
router.delete('/:id', requirePermission('DELETE_ARTICLE'), deleteArticle);

export default router;