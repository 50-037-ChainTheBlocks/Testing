const Cert = artifacts.require("CertChain");

module.exports = function (deployer) {
  deployer.deploy(Cert, {overwrite: false}); // Don't deploy this contract if it has already been deployed
};
