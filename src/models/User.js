const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./Task");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("EMail is invalid");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("password should not be equal to 'password' ");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("AGE MUST BE A POSITIVE NUMBER");
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// this field will not present in database but set the relationship between User and Task
userSchema.virtual("tasks", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "owner",
});

// we can create our own custom function using userSchema.statics on Model
// Statics are accessible on models and called model methods
userSchema.statics.findByCrendentials = async function (email, password) {
  const user = await User.findOne({ email });

  // if user not found
  if (!user) {
    throw new Error("unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  // if password not match
  if (!isMatch) {
    throw new Error("unable to login");
  }

  return user;
};

// userSchema.methods help to create custom function for specific user
// methods are accessible on instance and called instances method
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "thisismyjwt");

  user.tokens = user.tokens.concat({ token: token }); //setting token to tokens array of individual user
  await user.save(); //saving user

  return token;
};

// this toJSON Mehod will call automatically on object
userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.tokens;

  return userObj;
};

// Hash the plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// delete the tasks also when user is deleted
userSchema.pre("remove", async function (next) {
  const user = this;

  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema); // this schema creating job is mongoose doing already behind the scenes ,Here we have to do some work before save so we did this with own

module.exports = User;
