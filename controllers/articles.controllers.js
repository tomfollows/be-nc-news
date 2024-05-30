const {
  SelectByArticleId,
  selectAllArticles,
  checkArticleExists,
  fetchCommentsByArticleId,
  postCommentModel,
} = require("../models/articles.models");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  SelectByArticleId(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  selectAllArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  const promises = [
    checkArticleExists(articleId),
    fetchCommentsByArticleId(articleId),
  ];
  Promise.all(promises)
    .then((resolvedPromises) => {
      const comments = resolvedPromises[1];
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { author, body } = req.body;

  postCommentModel(article_id, author, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};
