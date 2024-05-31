const db = require("../db/connection");

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics").then((result) => {
    const topics = result.rows;
    if (!topics) return Promise.reject({ status: 404, msg: "Not found" });
    return topics;
  });
};

