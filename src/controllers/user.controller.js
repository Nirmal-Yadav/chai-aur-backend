import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Jwt } from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken;
    const refreshToken = user.generateRefreshToken;
    user.refreshToken = refreshToken;
    await user.save({ ValiditeBeforeSave: false });
  } catch (error) {
    throw new ApiError(500, "error in generating refresh and access token");

    return { accessToken, refreshToken };
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: "ok",
  //   });

  const { fullname, email, username, password } = res.body;
  console.log("email", email);

  //   if (fullname === "") {
  //     throw new ApiError(400, "fullname is required");
  //   }

  if (
    [fullname, email, username, password].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All field are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "user with this email or usernam ealready exists");
  }

  const avatarLocalPath = req.fields?.avatar[0]?.path;
  const coverLocalPath = req.fields?.avatar[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar field is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowercase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wromh while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user Register Succesfully"));
});

const loginUser = asyncHandler(async (res, req) => {
  const { email, username, password } = res.body;

  if (!username && !email) {
    throw new ApiError(400, "username or password is requiredconst ");
  }

  const user = User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user doesnot exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refershToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (res, req) => {
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      // set opeartaor
      refreshToken: undefined,
    },
  });
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRequestToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRequestToken) {
    throw new ApiError(401, "unauthorized token");
  }

  try {
    const decodedToken = jwt.verrify(
      incomingRequestToken,
      process.env.REFERSH_ACCESS_TOKEN
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    if (incomingRequestToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookies("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          200,
          { accessToken, refreshToken: newRefreshToken },
          "access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid old password");
  }

  user.password = newPassword;

  await user.save({ ValiditeBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password is updated and saved"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (res, req) => {
  const { fullname, email } = res.body;

  if (!fullname || !email) {
    throw new ApiError(400, "all field are required");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    { $set: { fullname, email } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "error wile uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { name: avatar.url, count: 1 } },
    { new: true }
  ).select(" -password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar updated succesfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "error wile uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { name: coverImage.url, count: 1 } },
    { new: true }
  ).select(" -password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated succesfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};
