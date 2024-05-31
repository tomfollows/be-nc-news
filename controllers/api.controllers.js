const { fetchUsers } = require("../models/api.models");

const getApi = (req, res, next) => {
  res.status(200).send({ endpoints: require("../endpoints.json") });
};

const getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

module.exports = { getApi, getUsers };