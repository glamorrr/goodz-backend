const { Router } = require('express');
const itemsController = require('../controllers/itemsController');
const formatImage = require('../middlewares/formatImage');
const upload = require('../middlewares/uploadImage');

const router = Router();

router.post('/', [upload, formatImage], itemsController.items_post);

module.exports = router;
