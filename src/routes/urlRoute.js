const { Router } = require('express');
const useragent = require('express-useragent');
const urlController = require('../controllers/urlController');

const router = Router();

router.get('/:url', urlController.url_get);
router.post(
  '/:url/pageview',
  useragent.express(),
  urlController.url_pageview_post
);

module.exports = router;
