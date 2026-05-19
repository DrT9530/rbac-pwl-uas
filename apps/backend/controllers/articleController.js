import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. GET ALL ARTICLES (Bisa diakses USER, EDITOR, ADMIN)
export const getAllArticles = async (req, res) => {
  try {
    const articles = await prisma.article.findMany({
      include: { author: { select: { username: true } } }
    });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CREATE ARTICLE (Butuh permission: CREATE_ARTICLE)
export const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.id; // Diambil dari token JWT hasil middleware

    const newArticle = await prisma.article.create({
      data: { title, content, authorId }
    });

    res.status(201).json({ message: 'Artikel berhasil dibuat', article: newArticle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. UPDATE ARTICLE (Butuh permission: UPDATE_ARTICLE)
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedArticle = await prisma.article.update({
      where: { id: parseInt(id) },
      data: { title, content }
    });

    res.status(200).json({ message: 'Artikel berhasil diperbarui', article: updatedArticle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. DELETE ARTICLE (Butuh permission: DELETE_ARTICLE)
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.article.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
