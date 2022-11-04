const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagsData = await Tag.findAll({
      include: [{ model: Product }]
    })
    res.status(200).json(tagsData)
  } catch (err) {
    res.status(500).json(err)
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagsData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }]
    })
    if (!tagsData) {
      res.status(404).json("Tag not found!")
    }
    res.status(200).json(tagsData)
  } catch (err) {
    res.status(500).json(err)
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  // try {
  //   const tagsData = await Tag.create({
  //     tag_name: req.body.tag_name
  //   })
  //   res.status(200).json(`Successfully Added ${req.body.tag_name}`)
  // } catch (err) {
  //   res.status(500).json(err)
  // }
  Tag.create(req.body)
    .then((tags) => {
      if (req.body.productIds.length) {
        const tagsProductIDArr = req.body.productIds.map((product_id) => {
          return {
            tag_id: tags.id,
            product_id,
          };
        });
        return ProductTag.bulkCreate(tagsProductIDArr);
      }

      res.status(200).json(tags);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  // Tag.update(req.params.id)
  //   .then((tags) => {
  //     if (req.body.productIds.length) {
  //       const tagsProductIDArr = req.body.productIds.map((product_id) => {
  //         return {
  //           tag_id: tags.id,
  //           product_id,
  //         };
  //       });
  //       return Tag.bulkCreate(tagsProductIDArr);
  //     }
  //     if (!tags) {
  //       res.status(200).json("Empty")
  //     }
  //     res.status(200).json(tags);
  //   })
  Tag.update(req.body, {
    where: {
      id: req.params.id
    }
  })
    .then((tags) => {
      return ProductTag.findAll({ where: { tag_id: req.params.id } })
    })
    .then((productTags) => {
      const productTagIds = productTags.map(({ product_id }) => product_id);

      const newProductTags = req.body.productIds
        .filter((product_id) => !productTagIds.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: req.params.id,
            product_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    })

});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const tagsData = await Tag.destroy({
      where: { id: req.params.id }
    });
    if (!tagsData) [
      res.status(404).json("Not Found")
    ]
    res.status(200).json(`Successfully deleted ${req.body.id}!`)
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;
