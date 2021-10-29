// const mongodb = require("mongodb");
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectId;

const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";

const databaseName = "task-manager";

const id = new ObjectID();
console.log(id);
// console.log(id.getTimestamp());

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (err, client) => {
  if (err) {
    return console.log("unable to connect to the database");
  }

  console.log("connected successfully !");

  const db = client.db(databaseName);

  // _________________________________TO INSERT DAATA_______________________________________________
  // db.collection("users").insertOne(
  //   {
  //     _id: id,
  //     name: "satvan",
  //     age: 17,
  //   },
  //   (error, result) => {
  //     if (error) {
  //       return console.log("unable to insert user");
  //     }

  //     console.log(result.insertedId);
  //   }
  // );

  // db.collection("users").insertMany(
  //   [
  //     {
  //       name: "aa",
  //       age: 10,
  //     },
  //     {
  //       name: "bb",
  //       age: 20,
  //     },
  //   ],
  //   (error, result) => {
  //     if (error) {
  //       return console.log("unable to insert users");
  //     }

  //     console.log(result.insertedIds);
  //   }
  // );

  // db.collection("tasks").insertMany(
  //   [
  //     {
  //       description: "wake up",
  //       completed: false,
  //     },
  //     {
  //       description: "bath",
  //       completed: false,
  //     },
  //   ],
  //   (error, result) => {
  //     if (error) {
  //       return console.log("unable to insert users");
  //     }

  //     console.log(result.insertedIds);
  //     console.log(result.insertedIds);
  //   }
  // );

  // _________________________________TO FETCH(READ) DAATA_______________________________________________

  // db.collection("users").findOne(
  //   {
  //     name: "satvan",
  //   },
  //   (error, user) => {
  //     if (error) {
  //       return console.log("unable to fetch data");
  //     }

  //     console.log(user);
  //   }
  // );

  // db.collection("users")
  //   .find({ age: 19 }) // find method will return an cursor and it not accept callback function
  //   .toArray((error, users) => {
  //     console.log(users);
  //   });

  // db.collection("users")
  //   .find({ age: 19 }) // find method will return an cursor and it not accept callback function
  //   .count((error, count) => {
  //     console.log(count);
  //   });

  // db.collection("tasks")
  //   .find({ completed: false })
  //   .toArray((error, task) => {
  //     console.log(task);
  //   });

  // _________________________________TO UPDATE DAATA_______________________________________________
  // db.collection("users")
  //   .updateOne(
  //     {
  //       _id: new ObjectID("6161b321172aff6501997e00"),
  //     },
  //     {
  //       $set: {
  //         name: "dainish",
  //       },
  //     }
  //   )
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  db.collection("tasks")
    .updateMany(
      {
        completed: false,
      },
      {
        $set: {
          completed: true,
        },
      }
    )
    .then((result) => {
      console.log(result.modifiedCount);
    })
    .catch((error) => {
      console.log(error);
    });
});
