const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/task-manager-api");

// const task1 = new Tasks({
//   description: "eat eggs      ",
//   //   completed: true,
// });

// task1
//   .save()
//   .then((result) => {
//     console.log(result);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
