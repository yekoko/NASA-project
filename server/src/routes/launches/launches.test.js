const request = require("supertest");
const app = require("../../app");

describe("Test GET /launches", () => {
  test("It should response with 200 success", async () => {
    const response = await request(app)
      .get("/launches")
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("Test POST /launch", () => {
  const testLaunchData = {
    mission: "ZTM156",
    rocket: "ZTM Experimental IS1",
    target: "Kepler-186 F",
    launchDate: "January 17, 1",
  };

  const testLaunchDataWithoutDate = {
    mission: "ZTM156",
    rocket: "ZTM Experimental IS1",
    target: "Kepler-186 F",
  };

  const testLaunchDataWithInvalidDate = {
    mission: "ZTM156",
    rocket: "ZTM Experimental IS1",
    target: "Kepler-186 F",
    launchDate: "aabb",
  };

  test("It should response with 201 created", async () => {
    const response = await request(app)
      .post("/launches")
      .send(testLaunchData)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    const requestDate = new Date(testLaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();

    expect(responseDate).toBe(requestDate);

    expect(response.body).toMatchObject(testLaunchDataWithoutDate);
  });

  test("It should catch missing require properties", async () => {
    const response = await request(app)
      .post("/launches")
      .send(testLaunchDataWithoutDate)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: "Missing required launch property!",
    });
  });

  test("It should catch invalid date format", async () => {
    const response = await request(app)
      .post("/launches")
      .send(testLaunchDataWithInvalidDate)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toStrictEqual({
      error: "Invalid Launch Date!",
    });
  });
});

describe("Test delete launch", () => {
  const testLaunchDeleteData = {
    upcoming: false,
    success: false,
  };
  test("It should response with 200 success", async () => {
    const response = await request(app).delete(`/launches/${100}`).expect(200);

    expect(response.body).toMatchObject(testLaunchDeleteData);
  });
});
