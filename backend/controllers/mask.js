const mongoose = require("mongoose");
const Mask = require("../models/mask");

const getAllMask = async (req, res, next) => {
  try {
    const allMasks = await Mask.find({});

    res.status(200).json({
      message: "Mask fetched successfully.",
      allMasks: allMasks,
    });
  } catch (err) {
    next(err);
  }
};

const getUserMask = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;

    const mask = await Mask.findById(userId);

    res.status(200).json({
      message: "Mask fetched successfully.",
      mask: mask,
    });
  } catch (err) {
    next(err);
  }
};

const updateUserMask = async (req, res, next) => {
  try {
    if (req.user == null) {
      const err = new Error("User is not authenticated.");
      err.statusCode = 401;
      throw err;
    }

    const userId = req.user._id;
    const email = req.user.email;
    const descriptors = req.body.descriptors;

    let mask = await Mask.findById(userId);

    if (!mask) {
      mask = new Mask({
        _id: mongoose.Types.ObjectId(userId),
        descriptors: descriptors,
        email: email,
      });
    } else mask.descriptors = descriptors;

    updatedMask = await mask.save();

    res.status(201).json({
      message: "Descriptors Updated Successfully",
      mask: updatedMask,
    });

  } catch (err) {
    next(err);
  }
};

const updateMask = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const descriptors = req.body.descriptors;
    const email = req.body.email;

    if (!userId && !descriptors) throw Error("Invalid Data Provided");

    let mask = await Mask.findOne({ userId: userId });

    if (!mask) {
      mask = new Mask({
        _id: mongoose.Types.ObjectId(userId),
        descriptors: descriptors,
        email: email,
      });
    } else mask.descriptors = descriptors;

    updatedMask = await mask.save();

    res.status(201).json({
      message: "Descriptors Updated Successfully",
      mask: updatedMask,
    });
  } catch (err) {
    next(err);
  }
};

// const updateMask = async (req, res, next) => {
//   try {
//     const userId = req.body.userId;
//     const descriptors = req.body.descriptors;

//     if (!userId && !descriptors) throw Error("Invalid Data Provided");

//     let mask = await Mask.findOne({ userId: userId });

//     mask.descriptors = descriptors;

//     updatedMask = await mask.save();

//     res.status(201).json({
//       message: "Descriptors Updated Successfully",
//       mask: updatedMask,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

exports.getAllMask = getAllMask;
exports.updateMask = updateMask;
exports.getUserMask = getUserMask;
exports.updateUserMask = updateUserMask;
