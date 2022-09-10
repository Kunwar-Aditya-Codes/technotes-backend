const User = require('../models/User');
const Note = require('../models/Notes');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();

  if (!users?.length) return res.status(400).json({ message: 'No user found' });

  res.json(users);
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields required!' });
  }

  const duplicate = await User.findOne({ username })
    .collation({
      locale: 'en',
      strength: 2,
    })
    .lean()
    .exec();

  if (duplicate) return res.status(409).json({ message: 'Duplicate username' });

  const hashPassword = await bcrypt.hash(password, 12);

  const userObject =
    !Array.isArray(roles) || !roles.length
      ? { username, password: hashPassword }
      : { username, password: hashPassword, roles };

  const user = await User.create(userObject);

  if (user) {
    res.status(201).json({ message: `New user ${username} created!` });
  } else {
    res.status(400).json({ message: 'Invalid data!' });
  }
});

// @desc Update user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  if (
    !id ||
    typeof active !== 'boolean' ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length
  ) {
    return res.status(400).json({ message: 'All fields required!' });
  }

  const user = await User.findById(id).exec();

  if (!user) return res.status(400).json({ message: 'No user found' });

  const duplicate = await User.findOne({ username })
    .collation({
      locale: 'en',
      strength: 2,
    })
    .lean()
    .exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate username' });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 12);
  }

  const updateUser = await user.save();

  res.json({ message: `${updateUser.username} updated!` });
});

// @desc Delete user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: 'User id required!' });

  const note = await Note.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: 'User is assigned some roles!' });
  }

  const user = await User.findById(id).exec();

  if (!user) return res.status(400).json({ message: 'User not found!' });

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID - ${result._id} deleted!`;

  res.json(reply);
});

module.exports = { getAllUsers, createNewUser, updateUser, deleteUser };
