const { Router } = require('express');
const storeController = require('../controllers/storeController');
const formatImage = require('../middlewares/formatImage');
const uploadImage = require('../middlewares/uploadImage');

const router = Router();

router.put('/is_credit', storeController.store_is_credit_put);
router.put('/url', storeController.store_url_put);
router.put('/currency', storeController.store_currency_put);
router.post(
  '/image',
  [uploadImage, formatImage({ width: 160, height: 160 })],
  storeController.store_image_post
);
router.post(
  '/background',
  [uploadImage, formatImage({ width: 1440, height: 450 })],
  storeController.store_background_post
);

module.exports = router;
