const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
//const launches = new Map();

let latestFlightNumber = 100;

const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: latestFlightNumber,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

// launches.set(launch.flightNumber, launch);
saveLaunch(launch);

async function existsLaunchWithId(launchId) {
  //   return launches.has(launchId);
  return await launches.findOne({ flightNumber: launchId });
}

async function getAllLaunches() {
  //   return Array.from(launches.values());
  return await launches.find({}, { _id: 0, __v: 0 });
}

async function saveLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet found!");
  }

  await launches.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

async function getLatestFlightNumber() {
  const lastestLaunch = await launches.findOne().sort("-flightNumber");
  if (!lastestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return lastestLaunch.flightNumber;
}

async function addNewLaunch(launch) {
  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: newFlightNumber,
    customers: ["Zero to Mystery", "NASA"],
    upcoming: true,
    success: true,
  });
  await saveLaunch(newLaunch);

  //   Object.assign(launch, {
  //     flightNumber: latestFlightNumber,
  //     customers: ["Zero to Mystery", "NASA"],
  //     upcoming: true,
  //     success: true,
  //   });

  //   launches.set(launch.flightNumber, launch);
}

async function deleteLaunchById(launchId) {
  //   const deleted = launches.get(launchId);
  //   deleted.upcoming = false;
  //   deleted.success = false;

  const deleted = await launches.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );
  return deleted.modifiedCount === 1;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  deleteLaunchById,
};
