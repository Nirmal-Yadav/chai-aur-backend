import dotenv from "dotenv"; // require('dotenv').config({path:'./env})
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB();

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
