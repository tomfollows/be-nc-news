const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const endpointsJson = require("../endpoints.json");
const jestSorted = require("jest-sorted");

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
      expect(body.msg).toBe("Route Not Found");
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
        expect(body.msg).toBe("Route Not Found");
      });
  });
});
describe("GET /api/articles/:article_id", () => {
  test("200: GET articles by the article id and responds with an article object, which should have the following properties: author, title, article_id, body, topic, created_at, votes, article_img_url", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
      });
  });
  test("404: will respond with a 404 when the server cannot find the requested resource", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route Not Found");
      });
  });
  test("400: will respond with a 400 when the server cannot find the requested resource", () => {
    return request(app)
      .get("/api/articles/notAnId")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});
describe("GET /api/articles", () => {
  test("200: GET /api/articles should respond with an articles array of article objects, each of which should have the relevant properties", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles.length).toBe(13);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            article_id: expect.any(Number),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(String),
          });
        });
      });
  });
  test("404: will respond with a 404 when the server cannot find the requested resource", () => {
    return request(app)
      .get("/api/artickles")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route Not Found");
      });
  });
});
//

describe("GET /api/articles/:article_id/comments", () => {
  test("200: GET /api/articles/:article_id/comments should respond with an array of comments for the given article_id, each of which should have the relevant properties", () => {
    return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toHaveLength(2);
        body.comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 3,
          });
        });
      });
  });

  test("200: articles should be sorted by created_at in descending order by default", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });

  test("200: responds with an empty array if there are no comments for a valid article_id", () => {
    return request(app)
      .get("/api/articles/7/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toEqual([]);
      });
  });

  test("404: will respond with a 404 when the route is not found", () => {
    return request(app)
      .get("/api/articles/1/comentz")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Route Not Found");
      });
  });

  test("400: will respond with a 400 when the article_id is invalid", () => {
    return request(app)
      .get("/api/articles/notAnId/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });

  test("404: responds with an error message if an article does not exist", () => {
    return request(app)
      .get("/api/articles/9999/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Article id invalid");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: POST /api/articles/:article_id/comments should respond with the posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        author: "butter_bridge",
        body: "This is a test comment",
      })
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          author: "butter_bridge",
          body: "This is a test comment",
        });
      });
  });
  test("400: ERROR - responds with the error if the data type for id is incorrect", () => {
    const comment = {
      username: "butter_bridge",
      body: "test comment",
      article_id: 1,
    };
    return request(app)
      .post("/api/articles/notAnID/comments")
      .send(comment)
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("404: ERROR - responds with The article id does not exist if article_id not present", () => {
    const comment = {
      username: "butter_bridge",
      body: "test comment",
      article_id: 1,
    };
    return request(app)
      .post("/api/articles/9999/comments")
      .send(comment)
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: PATCH /api/articles/:article_id should respond with the updated article with the addition of 1 vote", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: 1 })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(101);
      });
  });
  test("200: PATCH /api/articles/:article_id should respond with the updated article with subtraction of 1 vote", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -1 })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.votes).toBe(99);
      });
  });
  test("400: ERROR - responds with the error if the data type for id is incorrect", () => {
    return request(app)
      .patch("/api/articles/notAnID")
      .send({ inc_votes: 1 })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
  test("404: ERROR - responds with The article id does not exist if article_id not present", () => {
    return request(app)
      .patch("/api/articles/9999")
      .send({ inc_votes: 1 })
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found");
      });
  });
});
// CORE: DELETE /api/comments/:comment_id
// Description
// Should:

// be available on /api/comments/:comment_id.
// delete the given comment by comment_id.
// Responds with:

// status 204 and no content.
// Consider what errors could occur with this endpoint, and make sure to test for them.

// Remember to add a description of this endpoint to your /api endpoint.

describe("DELETE /api/comments/:comment_id", () => {
  test("204: DELETE /api/comments/:comment_id should respond with status 204 and no content", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then((res) => {
        expect(res.body).toEqual({});
      });
  });
  test("404: ERROR - responds with The comment id does not exist if comment_id not present", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Not Found");
      });
  });
  test("400: ERROR - responds with the error if the data type for id is incorrect", () => {
    return request(app)
      .delete("/api/comments/notAnID")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Bad Request");
      });
  });
});
