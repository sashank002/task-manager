const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL);

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
