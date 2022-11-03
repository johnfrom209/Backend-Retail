const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const productData = await Category.findAll({
      include: [{ model: Product }]
    });
    res.status(200).json(productData)
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const productData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    res.status(200).json(productData)
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create({
      category_name: req.body.category_name
    });
    res.status(200).json(newCategory);

  } catch (err) {
    res.status(500).json(err)
  }
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value
  try {
    const updateCategory = await Category.update({
      // edit by id
      // edit is equal to category_name
      category_name: req.body.category_name
    }, { where: { id: req.params.id } });
    res.status(200).json("Successfully Updated!");
  } catch (err) {
    res.status(500).json(err);
  }

});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const deleteCategory = await Category.destroy({ where: { id: req.params.id } }
    );
    if (!deleteCategory) {
      res._construct(404).json("Not Found")
    }
    res.status(200).json("Succesfully Deleted!");
  }
  catch (err) {
    res.status(500).json("Hell broke loose" + err);
  }
});

module.exports = router;
