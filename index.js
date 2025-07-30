const { getAllUsers } = require("./dist/functions/getAllUsers");
const { getUserReferrals } = require("./dist/functions/getUserReferrals");
const { getUserReferralInfo } = require("./dist/functions/getUserReferralInfo");
const { validateReferralCode } = require("./dist/functions/validateReferralCode");
const { createReferral } = require("./dist/functions/createReferral");

exports.getAllUsers = (req, res) => {
  getAllUsers(req, res);
};

exports.getUserReferrals = (req, res) => {
  getUserReferrals(req, res);
};

exports.getUserReferralInfo = (req, res) => {
  getUserReferralInfo(req, res);
};

exports.validateReferralCode = (req, res) => {
  validateReferralCode(req, res);
};

exports.createReferral = (req, res) => {
  createReferral(req, res);
};
