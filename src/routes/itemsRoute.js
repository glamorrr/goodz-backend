const { Router } = require('express');
const itemsController = require('../controllers/itemsController');
const uploadImage = require('../middlewares/uploadImage');
const formatImage = require('../middlewares/formatImage');

const router = Router();

router.post('/', itemsController.items_post);
router.put('/:id', itemsController.items_put);
router.delete('/:id', itemsController.items_delete);
router.post(
  '/:id/image',
  [uploadImage, formatImage({ width: 400, height: 400 })],
  itemsController.items_image_post
);

module.exports = router;
