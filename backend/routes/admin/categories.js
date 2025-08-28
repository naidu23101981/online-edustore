const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const isAdmin = require('../../middleware/isAdmin');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../../controllers/category.controller');

router.use(auth, isAdmin);

router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
