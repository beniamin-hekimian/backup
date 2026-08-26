import { prisma } from "../lib/prisma";
import catchAsync from "../utils/catchAsync.js";
import appError from "../utils/appError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/email.js";
import { promisify } from "node:util";

// ======================================================
// JWT
// ======================================================

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

// ======================================================
// SEND TOKEN
// ======================================================

const createSendToken = (user, statusCode, res) =>
{
  const token = signToken(user.id);

  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

// ======================================================
// COOKIE OPTIONS
// ======================================================

const cookieOptions = {
  expires: new Date(
    Date.now() +
    process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000
  ),
  httpOnly: true,
};

// ======================================================
// SIGNUP
// ======================================================

export const signup = catchAsync(async (req, res, next) =>
{
  const { full_name, email, password, confirmPassword } = req.body;

  if (!full_name || !email || !password || !confirmPassword)
    return next(new appError("Please provide all information!", 400));

  if (password !== confirmPassword)
    return next(
      new appError("Password and confirmPassword are not equal!", 400)
    );

  if (password.length <= 7)
    return next(new appError("Password is too short!", 400));

  const founded = await prisma.user.findUnique({
    where: { email },
  });

  if (founded)
    return next(new appError("You already have an account", 409));

  const passwordHashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      full_name,
      email,
      password_hash: passwordHashed,
    },
  });

  createSendToken(user, 201, res);
});

// ======================================================
// LOGIN
// ======================================================

export const login = catchAsync(async (req, res, next) =>
{
  const { email, password } = req.body;

  if (!email || !password)
    return next(
      new appError("Please provide email and password!", 400)
    );

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user)
    return next(new appError("User not found", 404));

  const checkPassword = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!checkPassword)
    return next(
      new appError("Incorrect password. Please try again!", 401)
    );

  createSendToken(user, 200, res);
});

// ======================================================
// PROTECT
// ======================================================

export const protect = catchAsync(async (req, res, next) =>
{
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
  {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token)
    return next(
      new appError(
        "You are not logged in! Please log in to get access.",
        401
      )
    );

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!currentUser)
    return next(
      new appError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );

  // Check if password was changed after token was issued
  if (changedPasswordAfter(currentUser, decoded.iat))
    return next(
      new appError(
        "User recently changed password! Please log in again.",
        401
      )
    );

  req.user = currentUser;

  next();
});

// ======================================================
// CHECK PASSWORD CHANGED
// ======================================================

const changedPasswordAfter = (user, JWTTimestamp) =>
{
  if (user?.passwordChangedAt)
  {
    const changedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// ======================================================
// ADMIN AUTHORIZATION
// ======================================================

export const restrictToAdmin = (req, res, next) =>
{
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({
      error: "Admins only",
    });

  next();
};

// ======================================================
// CHEF AUTHORIZATION
// ======================================================

export const restrictToChef = (req, res, next) =>
{
  if (req.user?.role !== "CHEF")
    return res.status(403).json({
      error: "Chefs only",
    });

  next();
};

// ======================================================
// LOGOUT
// ======================================================

export const logout = (req, res) =>
{
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

// ======================================================
// UPDATE PASSWORD
// ======================================================

export const updatePassword = catchAsync(async (req, res, next) =>
{
  const { passwordCurrent, password, confirmPassword } = req.body;

  if (!passwordCurrent || !password || !confirmPassword)
    return next(
      new appError(
        "passwordCurrent, password and confirmPassword must exist",
        400
      )
    );

  if (password !== confirmPassword)
    return next(
      new appError(
        "Password and confirmPassword are not equal",
        400
      )
    );

  if (password.length < 7)
    return next(new appError("Password is too short", 400));

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user)
    return next(new appError("User not found", 404));

  const isMatch = await bcrypt.compare(
    passwordCurrent,
    user.password_hash
  );

  if (!isMatch)
    return next(
      new appError("Your current password is wrong.", 401)
    );

  const hashedPassword = await bcrypt.hash(password, 16);

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      password_hash: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  createSendToken(updatedUser, 200, res);
});

// ======================================================
// CREATE PASSWORD RESET TOKEN
// ======================================================

export const createPasswordResetToken = async (user) =>
{
  const resetToken = crypto.randomBytes(32).toString("hex");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const passwordResetExpires = new Date(
    Date.now() + 10 * 60 * 1000
  );

  await prisma.user.update({
    where: { email: user.email },
    data: {
      passwordResetToken,
      passwordResetExpires,
    },
  });

  return resetToken;
};

// ======================================================
// FORGET PASSWORD
// ======================================================

export const forgetPassword = catchAsync(async (req, res, next) =>
{
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (!user)
    return next(
      new appError(
        "There is no user with email address.",
        404
      )
    );

  const resetToken = await createPasswordResetToken(user);

  const resetURL =
    `${req.protocol}://${req.get("host")}` +
    `/user/resetpassword/${resetToken}`;

  const message =
    `Forgot your password? Submit a PATCH request ` +
    `with your new password and passwordConfirm to: ` +
    `${resetURL}.\n` +
    `If you didn't forget your password, please ignore this email!`;

  try
  {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (err)
  {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return next(
      new appError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }
});

// ======================================================
// RESET PASSWORD
// ======================================================

export const resetPassword = catchAsync(async (req, res, next) =>
{
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user)
    return next(
      new appError(
        "Token is invalid or has expired.",
        400
      )
    );

  if (req.body.password !== req.body.passwordConfirm)
    return next(
      new appError("Passwords do not match", 400)
    );

  const hashedPassword = await bcrypt.hash(req.body.password, 12);

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
      passwordChangedAt: new Date(),
    },
  });

  createSendToken(updatedUser, 200, res);
});
