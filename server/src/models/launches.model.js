const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");
//const launches = new Map();

let latestFlightNumber = 100;

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACE_X_URL = "https://api.spacexdata.com/v4";

// const launch = {
//   flightNumber: latestFlightNumber,
//   mission: "Kepler Exploration X",
//   rocket: "Explorer IS1",
//   launchDate: new Date("December 27, 2030"),
//   target: "Kepler-442 b",
//   customers: ["ZTM", "NASA"],
//   upcoming: true,
//   success: true,
// };

// launches.set(launch.flightNumber, launch);
// saveLaunch(launch);

async function populateLaunches() {
  console.log("Downloading Launch Data!");
  const response = await axios.post(`${SPACE_X_URL}/launches/query`, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Something went wrong in SapceX api!");
    throw new Error("Launch data download failed!");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      customers,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
    };

    await saveLaunch(launch);
  }
}

async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    mission: "FalconSat",
    rocket: "Falcon 1",
  });
  if (firstLaunch) {
    console.log("Launch Data Aleady Loaded!");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  //   return launches.has(launchId);
  return await findLaunch({ flightNumber: launchId });
}

async function getAllLaunches(skip, limit) {
  //   return Array.from(launches.values());
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
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
  const lastestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!lastestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return lastestLaunch.flightNumber;
}

async function addNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet found!");
  }

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

  const deleted = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false }
  );
  return deleted.modifiedCount === 1;
}

module.exports = {
  loadLaunchesData,
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  deleteLaunchById,
};
