const { Router } = require('express');
const imagesController = require('../controllers/imagesController');

const router = Router();

router.delete('/:id', imagesController.images_delete);

module.exports = router;
