const mongoose = require("mongoose");

const MONGODB_URL =
  "mongodb+srv://yekokooo1991:xDytT2f8QmlNInC6@nasacluster.vvzyidn.mongodb.net/nasa?retryWrites=true&w=majority&appName=NASACluster";

mongoose.connection.once("open", () => {
  console.log("open");
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGODB_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
