const db = require("../db/connection");

exports.getArticles = () => {
  return db.query("SELECT * FROM articles").then((result) => {
    return result.rows;
  });
};

exports.SelectByArticleId = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Route Not Found" });
      } else {
        return result.rows[0];
      }
    });
};

exports.selectAllArticles = (topic) => {
  let queryStr = `
    SELECT 
      articles.author, 
      articles.title, 
      articles.topic, 
      articles.article_id, 
      articles.created_at, 
      articles.votes, 
      articles.article_img_url, 
      COUNT(comments.comment_id) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id`;

  const queryParams = [];

  if (topic !== undefined) {
    queryStr += ` WHERE articles.topic = $1`;
    queryParams.push(topic);
  }

  queryStr += `
    GROUP BY articles.article_id
    ORDER BY articles.created_at DESC`;

  return db.query(queryStr, queryParams).then((res) => res.rows);
};

exports.selectArticleComments = (article_id) => {
  return db
    .query(
      `SELECT *
      FROM comments
      WHERE article_id = $1
        ORDER BY created_at DESC`,
      [article_id]
    )
    .then((res) => {
      return res.rows;
    });
};

exports.checkArticleExists = (articleId) => {
  return db
    .query(
      `
      SELECT * FROM articles
      WHERE
      article_id = $1
      `,
      [articleId]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "Article id invalid" });
      }
    });
};

exports.fetchCommentsByArticleId = (articleId) => {
  return db
    .query(
      `
        SELECT * FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC
        `,
      [articleId]
    )
    .then((res) => {
      return res.rows;
    });
};

exports.postCommentModel = (article_id, author, body) => {
  return db
    .query(
      `INSERT INTO comments (article_id, author, body)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [article_id, author, body]
    )
    .then((res) => {
      return res.rows[0];
    })
    .catch((err) => {
      throw err;
    });
};

exports.VotesModel = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles
            SET votes = votes + $2
            WHERE article_id = $1
            RETURNING *`,
      [article_id, inc_votes]
    )
    .then((res) => {
      if (res.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      }
      return res.rows[0];
    });
};
