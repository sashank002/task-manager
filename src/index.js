const express = require("express");
require("./db/mongoose");

const userRoute = require("./routers/userRoute"); // importing route for users
const taskRoute = require("./routers/taskRoute"); // importing route for task

const app = express();
const port = process.env.PORT;

// *********************** EXPRESS MIDDLEWARE **********************************
// app.use((req, res, next) => {
//   if (req.method === "GET") {
//     res.send("jane la ");
//   } else {
//     next();
//   }
// });

app.use(express.json());

app.use(userRoute); // through this line app can listen route for users
app.use(taskRoute); // through this line app can listen route for tasks

//
// *************************  CONNECTING TO SERVER **************************************
app.listen(port, () => {
  console.log("Server is up on port ", port);
});

// const Task = require("./models/Task");
// const User = require("./models/User");

// const main = async () => {
//   const task = await Task.findById("617a809890091e4094779808");
//   await task.populate("owner");
//   console.log(task);

//   const user = await User.findById("617a804b720494065c8d2995");
//   await user.populate("tasks");
//   console.log(user.tasks);
// };

// main();
