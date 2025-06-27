const connectDB = require("./db.js");


(async () => {
  await connectDB();
})();
