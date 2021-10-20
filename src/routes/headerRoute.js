const { Router } = require('express');
const headerController = require('../controllers/headerController');

const router = Router();

router.post('/', headerController.header_post);
router.put('/:id', headerController.header_put);
router.delete('/:id', headerController.header_delete);

module.exports = router;
