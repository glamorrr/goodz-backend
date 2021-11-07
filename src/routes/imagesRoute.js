const { Router } = require('express');
const imagesController = require('../controllers/imagesController');
const verifyAuth = require('../middlewares/verifyAuth');

const router = Router();

router.delete('/:id', verifyAuth, imagesController.images_delete);

module.exports = router;
