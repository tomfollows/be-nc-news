const { fetchApi } = require("../models/api.models");

const getApi = (req, res, next) => {
  res.status(200).send({ endpoints: require("../endpoints.json") });
};

module.exports = { getApi };
