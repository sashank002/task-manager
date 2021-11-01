const express = require("express");
const User = require("../models/User");
const Auth = require("../middleware/Auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail } = require("../emails/account");

const route = express.Router();

// ************************* FOR ADDING USER **************************************
route.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name); // for sending welcome email
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

// ************************* LOGIn USER **************************************
route.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCrendentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateAuthToken();

    res.send({ user, token }); // here user call toJSON method automatically
  } catch (e) {
    res.status(400).send();
  }
});

// ************************* LOGOUT ONE (CURRENT) SESSION ONLY *************************************
route.post("/users/logout", Auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// ************************* LOGOUT ALL SESSIONS **************************************
route.post("/users/logoutAll", Auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//
// ************************* FOR READING PROFILE **************************************
route.get("/users/me", Auth, (req, res) => {
  // hrer first auth run

  //-⛔-⛔-⛔ below code is for reading all profile but user can't read someone's profile so , we can directly sent user profile back from req.user -⛔-⛔-⛔
  // User.find({})
  //   .then((users) => {
  //     res.send(users);
  //   })
  //   .catch((error) => {
  //     res.status(500).send(error);
  //   });

  res.send(req.user);
});

//
// *************************  FOR READING USER BY THEIR ID ********************************
// -❌-❌-❌now we no longer need this route since user can't read another profile by id -❌-❌-❌
// route.get("/users/:id", (req, res) => {
//   const _id = req.params.id;

//   User.findById(_id)
//     .then((user) => {
//       // if there is no user by provided id then if run
//       if (!user) {
//         return res.status(404).send("user not found");
//       }
//       // if everything go well then
//       res.status(200).send(user);
//     })
//     .catch((error) => {
//       res.status(500).send(error);
//     });
// });

// *************************  FOR UPDATING USER DETAILS *******************************
route.patch("/users/me", Auth, async (req, res) => {
  const updates = Object.keys(req.body); // Returns arrya of  keys of body object
  const allowedUpdates = ["name", "email", "password", "age"];
  const isvalid = updates.every((update) => {
    return allowedUpdates.includes(update);
  }); //every will return true only iff every return is true from function

  // if user want to update something that is not present in user then this if will run
  if (!isvalid) {
    return res.status(400).send({ error: "invalid updates" });
  }

  try {
    // const user = await User.findById(req.params.id);
    const user = req.user;

    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    //-⛔-⛔-⛔-⛔ this line working properly ,but we have to make some changes(like if user updating their password then we have to convert it into hash then save) before updating user so we did little bit arrangement-⛔-⛔-⛔-⛔
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    // new : true ====>> make sure that exisiting user get updated
    // runValidators: true, ===>> make sure that new updated value shoudl be valid

    // IF user not found by id then this if run
    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// ************************* FOR UPLOADING PHOTO  ********************************
const upload = multer({
  // dest: "avatars",              // this will save the file in avatar folder
  limits: {
    // for limit the file size
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    // for accepting the specific file only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("please uplaod only image"));
    }

    cb(undefined, true);
  },
});

route.post(
  "/users/me/avatar",
  Auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer) // sharp is used for edit image before uplaoding
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;

    // req.user.avatar = req.file.buffer; // req.file is the file that we uploaded and req.file.buffer is the file in buffer format
    await req.user.save(); // saving the user with photo added
    res.send();
  },
  (error, req, res, next) => {
    // this function is useful in sending effective json error messages
    res.status(400).send({ error: error.message });
  }
);

// ************************* FOR DELETING AVATAR  ********************************

route.delete("/users/me/avatar", Auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send("avatar deleted successfully !");
});

// ************************* FOR ACCESSING AVATAR BY USER ID  ********************************
route.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error("image not found");
    }

    res.set("Content-Type", "image/jpg"); //settig the header using set method on response
    res.send(user.avatar);
  } catch (e) {
    res.status(500).send();
  }
});

// ************************* FOR DELETING USER  ********************************
route.delete("/users/me", Auth, async (req, res) => {
  try {
    // -⛔-⛔-⛔this works fine but now we have better way of doing this same thing -⛔-⛔-⛔
    // const user = await User.findByIdAndDelete(req.user._id);

    // if (!user) {
    //   return res.status(404).send();
    // }

    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = route;
