import dotenv from "dotenv"; // require('dotenv').config({path:'./env})
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("serever is running on port :", process.env.PORT);
    });
    app.on("error", (error) => {
      console.log("ERR:", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("mongo db connection failed !!!", err);
  });
// function connectDB(){

// }

// connectDB()

// ///////////////////////////////////first approach
// const app = express();

// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERR:", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`App is listening on port ${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("ERROR", error);
//     throw err;
//   }
// })();
