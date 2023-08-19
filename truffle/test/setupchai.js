"use strict";
var chai = require("chai");
const BN = web3.utils.BN;
const chaiBN = require("chain-bn")(BN);
chai.use(chainBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
module.exports = chai;