const { Router } = require('express');
const headerController = require('../controllers/headerController');

const router = Router();

router.post('/', headerController.header_post);
router.put('/:id', headerController.header_put);

module.exports = router;
