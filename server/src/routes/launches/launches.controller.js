const {
  getAllLaunches,
  addNewLaunch,
  existsLaunchWithId,
  deleteLaunchById,
} = require("../../models/launches.model");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.target ||
    !launch.launchDate
  ) {
    return res.status(400).json({
      error: "Missing required launch property!",
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid Launch Date!",
    });
  }

  await addNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpDeleteLaunch(req, res) {
  const launchId = Number(req.params.id);
  const existedLaunch = await existsLaunchWithId(launchId);
  if (!existedLaunch) {
    return res.status(400).json({
      error: "Launch not found!",
    });
  }
  const deleted = await deleteLaunchById(launchId);
  if (!deleted) {
    return res.status(400).json({
      error: "Launch not deleted!",
    });
  }
  return res.status(200).json({
    ok: true,
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpDeleteLaunch,
};
