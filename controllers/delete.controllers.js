const { deleteCommentByIdFromDB } = require("../models/delete.model");

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentByIdFromDB(comment_id)
    .then(() => {
      res.status(204).send("No Content");
    })
    .catch(next);
};
