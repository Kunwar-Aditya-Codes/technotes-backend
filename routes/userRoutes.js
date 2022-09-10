const express = require('express');
const router = express.Router();
const {
  createNewUser,
  getAllUsers,
  updateUser,
  deleteUser,
} = require('../controller/usersController');
const verifyJwt = require('../middleware/verifyJwt');

router.use(verifyJwt);

router
  .route('/')
  .get(getAllUsers)
  .post(createNewUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
