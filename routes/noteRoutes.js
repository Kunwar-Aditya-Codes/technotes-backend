const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  createNewNotes,
  deleteNotes,
  updateNotes,
} = require('../controller/notesController');
const verifyJwt = require('../middleware/verifyJwt');

router.use(verifyJwt);

router
  .route('/')
  .get(getAllNotes)
  .post(createNewNotes)
  .patch(updateNotes)
  .delete(deleteNotes);

module.exports = router;
