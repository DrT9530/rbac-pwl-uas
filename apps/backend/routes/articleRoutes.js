const express = require('express');
const router = express.Router();
const { getAllArticles, createArticle, updateArticle, deleteArticle } = require('../controllers/articleController');

// Import middleware punya Atha (Sesuaikan path-nya nanti)
const { authenticateUser, requirePermission } = require('../middleware/authMiddleware'); 

// Semua route artikel wajib login dulu (authenticateUser)
router.use(authenticateUser);

// Penerapan RBAC berdasarkan Target Minimal Presentasi
router.get('/', requirePermission('READ_ARTICLE'), getAllArticles);
router.post('/', requirePermission('CREATE_ARTICLE'), createArticle);
router.put('/:id', requirePermission('UPDATE_ARTICLE'), updateArticle);
router.delete('/:id', requirePermission('DELETE_ARTICLE'), deleteArticle);

module.exports = router;