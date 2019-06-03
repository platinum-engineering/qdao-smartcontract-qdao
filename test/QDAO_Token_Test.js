// test/.QDAO_Token_Test.js
const QDAO = artifacts.require("QDAO");

const ETHER = 10**18;
const TOKEN = 10**18;


contract("QDAOToken", accounts => {

     const [firstAccount,
            secondAccount,
            thirdaccount,
            fourthaccount,
            fifthaccount,
            firstOwner,
            secondOwner,
            thirdOwner,
            fourthOwner,
            fifthOwner] = accounts;

    let daoToken;

    beforeEach(async () => {
        daoToken = await QDAO.new(firstOwner, secondOwner, thirdOwner, fourthOwner, fifthOwner);
    });
    it("#1 should initialize correctly", async () => {

        assert.equal(await daoToken.symbol.call(), "QDAO");
        assert.equal(await daoToken.name.call(), "Q DAO Governance token v1.0");

        let DEC = await daoToken.decimals.call()
        console.log("      DECIMALS -  " + web3.toBigNumber(DEC).toString() )
        let OWNER_LIMIT = await daoToken.howManyOwnersDecide.call()
        console.log("      How Many Owners Decide - " + web3.toBigNumber(OWNER_LIMIT).toString() )

        const newTokenBalance = web3.eth.getBalance(daoToken.address);
        console.log("      Init balance - " + web3.toBigNumber(newTokenBalance).toString() )
    });

    it("#2 should transfer to Ownerships", async () => {
        await daoToken.transferOwnership(secondAccount, secondOwner, {from: firstOwner})

        await daoToken.transferOwnership(secondAccount, secondOwner, {from: fourthOwner})

        await daoToken.transferOwnership(secondAccount, secondOwner, {from: fifthOwner})
        try {
            await daoToken.transferOwnership(secondAccount, secondOwner, {from: fifthOwner})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        await daoToken.transferOwnership(secondAccount, secondOwner, {from: firstAccount})

        try {
            await daoToken.transferOwnership(secondOwner, secondAccount, {from: secondOwner})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        try {
            await daoToken.transferOwnership(secondOwner, secondAccount, {from: thirdaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        try {
            await daoToken.transferOwnership(secondOwner, secondAccount, {from: fourthaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
        try {
            await daoToken.transferOwnership(secondOwner, secondAccount, {from: fifthaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await daoToken.transferOwnership(secondOwner, secondAccount, {from: secondAccount})
    });

    it("#3 should be created 1000 daoTokens", async () => {
        try {
            await daoToken.mint(firstOwner, 1000*ETHER, {from: firstOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await daoToken.addAddressToGovernanceContract(firstOwner, {from: firstOwner});
        await daoToken.addAddressToGovernanceContract(firstOwner, {from: firstAccount});
        await daoToken.addAddressToGovernanceContract(firstOwner, {from: thirdOwner});

        try {
            await daoToken.mint(firstOwner, 1000*TOKEN, {from: firstOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await daoToken.addAddressToGovernanceContract(firstOwner, {from: fourthOwner});

        await daoToken.mint(firstOwner, 1000*TOKEN, {from: firstOwner});
        assert.equal(await daoToken.totalSupply.call(), 1000*TOKEN);
        assert.equal(await daoToken.balanceOf.call(firstOwner), 1000*TOKEN);
    });

    it("#4 should be born 1000 daoTokens", async () => {

        await daoToken.addAddressToGovernanceContract(firstOwner, {from: firstOwner});
        await daoToken.addAddressToGovernanceContract(firstOwner, {from: firstAccount});
        await daoToken.addAddressToGovernanceContract(firstOwner, {from: thirdOwner});
        await daoToken.addAddressToGovernanceContract(firstOwner, {from: fourthOwner});

        await daoToken.mint(secondAccount, 777*TOKEN, {from: firstOwner});

        assert.equal(await daoToken.totalSupply.call(), 777*TOKEN);
        assert.equal(await daoToken.balanceOf.call(secondAccount), 777*TOKEN);

        try {
            await daoToken.burnFrom(secondAccount, 778*TOKEN, {from: firstOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }

        await daoToken.burnFrom(secondAccount, 777*TOKEN, {from: firstOwner});

        assert.equal(await daoToken.totalSupply.call(), 0);
        assert.equal(await daoToken.balanceOf.call(secondAccount), 0);
    });

    it("#5 does not allow non-owners to call",  async () => {
        assert.equal(await daoToken.totalSupply.call(), 0);

        try {
            await daoToken.pause({from:secondAccount});
            await daoToken.addAddressToGovernanceContract(thirdaccount, {from: thirdaccount});
            await daoToken.removeAddressFromGovernanceContract(firstOwner, {from: fourthaccount});
            await daoToken.transferOwnership(secondOwner, fifthaccount, {from: fifthaccount})
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
    });

    it("#6 USDQ Lender should be 'transferFrom' tokens from  account", async () => {
        // USDQ Lender = fifthaccount
        await daoToken.addAddressToGovernanceContract(fifthaccount, {from: firstOwner});
        await daoToken.addAddressToGovernanceContract(fifthaccount, {from: firstAccount});
        await daoToken.addAddressToGovernanceContract(fifthaccount, {from: thirdOwner});
        await daoToken.addAddressToGovernanceContract(fifthaccount, {from: fourthOwner});

        await daoToken.mint(secondAccount, 666*TOKEN, {from: fifthaccount});
        assert.equal(await daoToken.totalSupply.call(), 666*TOKEN);
        assert.equal(await daoToken.balanceOf.call(secondAccount), 666*TOKEN);

        await daoToken.transfer(thirdaccount, 333*TOKEN, {from: secondAccount});
        assert.equal(await daoToken.balanceOf.call(secondAccount), 333*TOKEN);
        assert.equal(await daoToken.balanceOf.call(thirdaccount), 333*TOKEN);

        assert.equal(await daoToken.balanceOf.call(fifthaccount), 0);


        await daoToken.approveForOtherContracts(secondAccount, fifthaccount, 333*TOKEN, {from: fifthaccount});
        await daoToken.transferFrom(secondAccount, fifthaccount, 333*TOKEN, {from: fifthaccount});

        assert.equal(await daoToken.balanceOf.call(fifthaccount), 333*TOKEN);
        assert.equal(await daoToken.balanceOf.call(secondAccount), 0);
        assert.equal(await daoToken.totalSupply.call(), 666*TOKEN);
    });

    it("#7 fourth owner cannot change the voting parameters", async () => {

        await daoToken.transferOwnership(secondAccount, secondOwner, {from: firstOwner})
        assert.equal(await daoToken.isOwner(secondOwner), true);
        assert.equal(await daoToken.isOwner(secondAccount), false);

        await daoToken.transferOwnership(secondAccount, secondOwner, {from: fourthOwner})
        assert.equal(await daoToken.isOwner(secondOwner), true);
        assert.equal(await daoToken.isOwner(secondAccount), false);

        await daoToken.transferOwnership(secondAccount, secondOwner, {from: fifthOwner})
        assert.equal(await daoToken.isOwner(secondOwner), true);
        assert.equal(await daoToken.isOwner(secondAccount), false)

        assert.equal(await daoToken.allOperationsCount(), 1);

        await daoToken.transferOwnership(thirdaccount, firstOwner, {from: secondOwner})

        assert.equal(await daoToken.allOperationsCount(), 2);
        assert.equal(await daoToken.isOwner(secondOwner), true);
        assert.equal(await daoToken.isOwner(secondAccount), false);

        assert.equal(await daoToken.isOwner(thirdaccount), false);
        assert.equal(await daoToken.isOwner(firstOwner), true);


        await daoToken.transferOwnership(secondAccount, secondOwner, {from: secondOwner});

        assert.equal(await daoToken.allOperationsCount(), 1);
        assert.equal(await daoToken.isOwner(secondOwner), false);
        assert.equal(await daoToken.isOwner(secondAccount), true);

        assert.equal(await daoToken.isOwner(thirdaccount), false);
        assert.equal(await daoToken.isOwner(firstOwner), true);

        try {
            await daoToken.transferOwnership(secondOwner, secondAccount, {from: secondOwner});
            assert.fail();
        } catch (err) {
            assert.ok(/revert/.test(err.message));
        }
    });
});