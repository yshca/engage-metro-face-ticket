const mongoose = require("mongoose");

const User = require("../models/user");
const History = require("../models/history");

const Withdraw = "Withdraw";
const Deposit = "Deposit";

const getUser = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("Could not find user by id.");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({
      message: "User successfully fetched.",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      const err = new Error("Please provide a userId.");
      err.statusCode = 404;
      throw err;
    }
    const user = await User.findById(userId);

    res.status(200).json({
      message: "User successfully fetched.",
      user: user,
    });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not logged in.");
      err.statusCode = 401;
      throw err;
    }

    const name = req.body.name;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("Could not find user by id.");
      err.statusCode = 404;
      throw err;
    }

    user.name = name;

    const savedUser = await user.save();
    res.status(201).json({
      message: "User successfully updated.",
      userId: savedUser._id.toString(),
      name: savedUser.name,
      email: savedUser.email,
    });
  } catch (err) {
    next(err);
  }
};

const updateBalance = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not logged in.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    let currentBalance = user.currentBalance;

    if (!user) {
      const err = new Error("Could not find user by id.");
      err.statusCode = 404;
      throw err;
    }

    const amount = req.body.amount;
    const type = req.body.type;

    if (type === Withdraw) {
      if (currentBalance <= 0) {
        const err = new Error("Insufficient Balance");
        err.statusCode = 404;
        throw err;
      }
      currentBalance -= amount;
    } else if (type === Deposit) currentBalance += amount;
    else currentBalance -= amount;

    user.currentBalance = currentBalance;
    user.balanceHistory.push({
      date: Date.now(),
      amount: amount,
      type: type,
    });

    const savedUser = await user.save();

    res.status(201).json({
      message: "Balance successfully updated.",
      user: savedUser,
    });
  } catch (err) {
    next(err);
  }
};

const updateBalanceById = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const amount = req.body.amount;
    const type = req.body.type;

    if (!userId) {
      const err = new Error("Please provide a userId.");
      err.statusCode = 404;
      throw err;
    }

    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("Could not find user by id.");
      err.statusCode = 404;
      throw err;
    }

    let currentBalance = user.currentBalance;

    if (type === Withdraw) {
      if (currentBalance <= 0) {
        const err = new Error("Insufficient Balance");
        err.statusCode = 404;
        throw err;
      }
      currentBalance -= amount;
    } else currentBalance += amount;

    user.currentBalance = currentBalance;
    user.balanceHistory.push({
      date: Date.now(),
      amount: amount,
      type: type,
    });

    const savedUser = await user.save();

    res.status(201).json({
      message: "Balance successfully updated.",
      user: savedUser,
    });
  } catch (err) {
    next(err);
  }
};

const markEntry = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const stnNo = req.body.stnNo;

    if (!userId && !stnNo) throw Error("Invalid Data Provided");

    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("User does not exist.");
      err.statusCode = 404;
      throw err;
    }

    if (user.entry != -1) {
      const err = new Error("User Entry Station Already Exists.");
      err.statusCode = 404;
      throw err;
    }

    user.entry = stnNo;

    const savedUser = await user.save();

    res.status(201).json({
      message: "Entry successfully updated.",
      user: savedUser,
    });
  } catch (err) {
    next(err);
  }
};

const markExit = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const exitStnNo = req.body.stnNo;

    if (!userId && !stnNo) throw Error("Invalid Data Provided");

    const user = await User.findById(userId);

    if (!user) {
      const err = new Error("User does not exist.");
      err.statusCode = 404;
      throw err;
    }

    if (user.entry === -1) {
      const err = new Error("User Entry does not exist.");
      err.statusCode = 404;
      throw err;
    }

    const entryStnNo = user.entry;
    user.entry = -1;

    const transactionHistory = new History({
      userId: mongoose.Types.ObjectId(userId),
      source: entryStnNo,
      destination: exitStnNo,
    });

    const savedTransactionHistory = await transactionHistory.save();
    const savedUser = await user.save();

    res.status(201).json({
      message: "Entry successfully updated.",
      user: savedUser,
      transactionHistory: savedTransactionHistory,
    });
  } catch (err) {
    next(err);
  }
};

const isLoggedIn = async (req, res, next) => {
  res.send(req.user);
};

exports.getUser = getUser;
exports.updateUser = updateUser;
exports.updateBalance = updateBalance;
exports.markEntry = markEntry;
exports.markExit = markExit;
exports.isLoggedIn = isLoggedIn;
exports.getUserById = getUserById;
exports.updateBalanceById = updateBalanceById;