const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const endpointsJson = require("../endpoints.json");

beforeEach(() => {
  return seed(testData);
});

afterAll(() => {
  return db.end();
});

describe("GET api/topics", () => {
  test("200: GET /api/topics responds with an array of topic objects, each of which should have the following properties,slug, description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
  });
});
test("404: will respond with a 404 when the server cannot find the requested resource", () => {
  return request(app)
    .get("/api/topic")
    .expect(404)
    .then(({ body }) => {
      expect(body.msg).toBe("Route not found");
    });
});

describe("GET /api", () => {
  test("200: GET /api responds with a JSON object describing all available endpoints on the API and how to interact with them", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((res) => {
        const endpoints = res.body.endpoints;
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  test("404: will respond with a 404 when the server cannot find the requested resource", () => {
    return request(app)
      .get("/ap")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route not found");
      });
  });
});

