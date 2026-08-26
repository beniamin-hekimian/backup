import express from 'express'
import * as tagController from '../controllers/tagController.js'
import * as authController from '../controllers/authController'
const router = express.Router()
router.use(authController.protect);
router.route('/')
    .get(tagController.getAllTags)
    //only admins
router.use(authController.restrictToAdmin)
router.route('/:id')
    .patch(tagController.updateTag)
    .delete(tagController.deleteTag)

export default router;