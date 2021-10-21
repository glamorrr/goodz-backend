const { Router } = require('express');
const storeController = require('../controllers/storeController');
const formatImage = require('../middlewares/formatImage');
const uploadImage = require('../middlewares/uploadImage');

const router = Router();

router.put('/is_credit', storeController.store_is_credit_put);
router.post(
  '/image',
  [uploadImage, formatImage({ width: 160, height: 160 })],
  storeController.store_image_post
);

module.exports = router;
