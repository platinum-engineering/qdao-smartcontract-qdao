const QDAO = artifacts.require("./QDAO/QDAO.sol");

require('dotenv').config();
const delay = require('delay');

const paused = parseInt( process.env.DELAY_MS || "60000" );

const firstAddress = process.env.ADDRESS_FIRST_OWNER;
if(!firstAddress){
    throw("ADDRESS_FIRST_OWNER is not configured in .env!");
}

const secondAddress =  process.env.ADDRESS_SECOND_OWNER;
if(!secondAddress){
    throw("ADDRESS_SECOND_OWNER is not configured in .env!");
}

const thirdAddress =  process.env.ADDRESS_THIRD_OWNER;
if(!thirdAddress){
    throw("ADDRESS_THIRD_OWNER is not configured in .env!");
}

const governanceAddress =  process.env.ADDRESS_GOVERNANCE;
if(!governanceAddress){
    throw("ADDRESS_GOVERNANCE is not configured in .env!");
}

const wait = async (param) => {console.log("Delay " + paused); await delay(paused); return param;};

module.exports = function(deployer) {
    deployer.then(async () => {
        await wait();

        await wait(await deployer.deploy(QDAO, firstAddress, secondAddress, thirdAddress, governanceAddress));
    });
};
