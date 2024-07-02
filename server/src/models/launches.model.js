const launches = new Map();

let latestFlightNumber = 100;

const launch = {
  flightNumber: latestFlightNumber,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customer: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

launches.set(launch.flightNumber, launch);

function existsLaunchWithId(launchId) {
  return launches.has(launchId);
}

function getAllLaunches() {
  return Array.from(launches.values());
}

function addNewLaunch(launch) {
  latestFlightNumber++;
  Object.assign(launch, {
    flightNumber: latestFlightNumber,
    customer: ["Zero to Mystery", "NASA"],
    upcoming: true,
    success: true,
  });

  launches.set(launch.flightNumber, launch);
}

function deleteLaunchById(launchId) {
  const deleted = launches.get(launchId);
  deleted.upcoming = false;
  deleted.success = false;
  return deleted;
}

module.exports = {
  existsLaunchWithId,
  getAllLaunches,
  addNewLaunch,
  deleteLaunchById,
};
