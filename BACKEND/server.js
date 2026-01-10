require('dotenv').config();
const app = require("./app");
const { connectToDB } = require("./Config/DB");
const port = process.env.PORT || 5000;
const CronJob = require("./Controllers/CronJob");

connectToDB();

CronJob();
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
