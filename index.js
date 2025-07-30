const { getAllUsers } = require("./dist/functions/getAllUsers");

exports.getAllUsers = (req, res) => {
  getAllUsers(req, res);
};
