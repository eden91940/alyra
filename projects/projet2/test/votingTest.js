const VotingTest = artifacts.require("./Voting.sol");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');

const Chance = require('chance');
const chance = new Chance();

//TESTS UNITAIRES SOUS TRUFFLE PROJETS VOTING ALYRA
contract('Voting', accounts => {

    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    let VotingInstance;

    describe("Test getVoter", function () {

        const nonVoters = [owner, account3];

        before(async function () {
            VotingInstance = await VotingTest.new({from: owner});
            // on enregistre 2 voters
            await VotingInstance.addVoter(account1, {from: owner});
            await VotingInstance.addVoter(account2, {from: owner});
            console.log("Account owner = [" + owner + "]")
            console.log("Accounts registered = [" + account1 + ", " + account2 + "]")
        });

        //test dynamique
        nonVoters.forEach((account) => {
            it("Account [" + account + "] should be a voter to get a voter", async () => {
                await expectRevert(VotingInstance.getVoter(account3, {from: account}), "You're not a voter");
            });
        });

        it("Account [" + account1 + "] should get a registered voter", async () => {
            const voterData = await VotingInstance.getVoter(account1, {from: account1});
            expect(voterData.isRegistered).to.be.true;
            expect(voterData.hasVoted).to.be.false;
            expect(new BN(voterData.votedProposalId)).to.be.bignumber.equal(new BN(0));
        });

        it("Account [" + account2 + "] should get a non registered voter", async () => {
            const voterData = await VotingInstance.getVoter(account3, {from: account2});
            expect(voterData.isRegistered).to.be.false;
            expect(voterData.hasVoted).to.be.false;
            expect(new BN(voterData.votedProposalId)).to.be.bignumber.equal(new BN(0));
        });

    });

    describe("Test addVoter", function () {

        before(async function () {
            VotingInstance = await VotingTest.new({from: owner});
            // on enregistre 1 voters
            await VotingInstance.addVoter(account1, {from: owner});
            console.log("Account owner = [" + owner + "]")
            console.log("Account registered = [" + account1 + "]")
        });

        it("Account [" + account1 + "] should be owner", async () => {
            await expectRevert(VotingInstance.addVoter(account2, {from: account1}), "Ownable: caller is not the owner");
        });

        it("Account [" + account1 + "] should be not already registered", async () => {
            await expectRevert(VotingInstance.addVoter(account1, {from: owner}), "Already registered");
        });

        //cas nominal
        it("Account [" + account2 + "] should be registered", async () => {
            const registeredEvent = await VotingInstance.addVoter(account2, {from: owner});

            const voterData = await VotingInstance.getVoter(account2, {from: account1});
            expect(voterData.isRegistered).to.be.true;
            expect(voterData.hasVoted).to.be.false;
            expect(new BN(voterData.votedProposalId)).to.be.bignumber.equal(new BN(0));

            expectEvent(registeredEvent, "VoterRegistered", {voterAddress: account2});

        });

        it("Voters registration should be opened", async () => {
            await VotingInstance.startProposalsRegistering();
            await expectRevert(VotingInstance.addVoter(account2, {from: owner}), "Voters registration is not open yet");
        });

    });

    describe("Test getOneProposal", function () {

        const nonVoters = [owner, account3];

        before(async function () {
            VotingInstance = await VotingTest.new({from: owner});
            // on enregistre 2 voters
            await VotingInstance.addVoter(account1, {from: owner});
            await VotingInstance.addVoter(account2, {from: owner});
            await VotingInstance.startProposalsRegistering();
            await VotingInstance.addProposal("testAlyra", {from: account1});
            console.log("Account owner = [" + owner + "]")
            console.log("Accounts registered = [" + account1 + ", " + account2 + "]")
        });

        it("should be a voter to get a proposal", async () => {
            const nonVoter = chance.pickone(nonVoters);
            // pour tester une autre méthode que le forEach
            console.log("Account nonVoter picked = [" + nonVoter + "]")
            await expectRevert(VotingInstance.getOneProposal(chance.integer({min: 0, max: 10000}), {from: nonVoter}), "You're not a voter");
        });

        it("should get a proposal already added", async () => {
            const proposalData = await VotingInstance.getOneProposal(0, {from: account1});
            expect(proposalData.description).to.equal("testAlyra");
            expect(new BN(proposalData.voteCount)).to.be.bignumber.equal(new BN(0));
        });

        it("should revert when getting a unknown proposal", async () => {
            await expectRevert(VotingInstance.getOneProposal(chance.integer({min: 1, max: 10000}), {from: account1}), "revert");
        });


    });

    describe("Test addProposal", function () {

        const nonVoters = [owner, account3];

        beforeEach(async function () {
            VotingInstance = await VotingTest.new({from: owner});
            // on enregistre 2 voters
            await VotingInstance.addVoter(account1, {from: owner});
            await VotingInstance.addVoter(account2, {from: owner});
            console.log("Account owner = [" + owner + "]")
            console.log("Accounts registered = [" + account1 + ", " + account2 + "]")
        });

        it("should be a voter to add a proposal", async () => {
            const nonVoter = chance.pickone(nonVoters);
            // pour tester une autre méthode que le forEach
            console.log("Account nonVoter picked = [" + nonVoter + "]")
            await expectRevert(VotingInstance.getOneProposal(chance.integer({min: 0, max: 10000}), {from: nonVoter}), "You're not a voter");
        });

        it("Proposals registration should be opened", async () => {
            await expectRevert(VotingInstance.addProposal("testAlyra", {from: account1}), "Proposals are not allowed yet");
        });

        it("should add a complete proposal", async () => {
            const changeWorkflowEvent = await VotingInstance.startProposalsRegistering();
            expectEvent(changeWorkflowEvent, "WorkflowStatusChange", {previousStatus: new BN(0), newStatus: new BN(1)});
            await expectRevert(VotingInstance.addProposal("", {from: account1}), "Vous ne pouvez pas ne rien proposer");
        });

        //cas nominal
        it("should add several proposal", async () => {
            await VotingInstance.startProposalsRegistering();
            for (let i = 0; i < 9; i++) {
                const proposalRegisteredEvent = await VotingInstance.addProposal("testAlyra" + i, {from: account1});
                const proposalData = await VotingInstance.getOneProposal(i, {from: account1});
                expect(proposalData.description).to.equal("testAlyra" + i);
                expect(new BN(proposalData.voteCount)).to.be.bignumber.equal(new BN(0));
                expectEvent(proposalRegisteredEvent, "ProposalRegistered", {proposalId: new BN(i)});
            }
        });

    });


    describe("Test setVote", function () {

        const nonVoters = [owner, account3];

        before(async function () {
            VotingInstance = await VotingTest.new({from: owner});
            // on enregistre 2 voters
            await VotingInstance.addVoter(account1, {from: owner});
            await VotingInstance.addVoter(account2, {from: owner});
            await VotingInstance.startProposalsRegistering();
            // on enregsitre 2 propositions
            await VotingInstance.addProposal("testAlyra1", {from: account1});
            await VotingInstance.addProposal("testAlyra2", {from: account2});
            console.log("Account owner = [" + owner + "]")
            console.log("Accounts registered = [" + account1 + ", " + account2 + "]")
        });

        it("should be a voter", async () => {
            const nonVoter = chance.pickone(nonVoters);
            console.log("Account nonVoter picked = [" + nonVoter + "]")
            await expectRevert(VotingInstance.setVote(chance.integer({min: 0, max: 10000}), {from: nonVoter}), "You're not a voter");
        });

        it("Voting session should be started", async () => {
            await expectRevert(VotingInstance.setVote(0, {from: account1}), "Voting session havent started yet");
        });

        it("should vote for existing proposal", async () => {
            const changeWorkflowEventEndPropRegistration = await VotingInstance.endProposalsRegistering();
            expectEvent(changeWorkflowEventEndPropRegistration, "WorkflowStatusChange", {previousStatus: new BN(1), newStatus: new BN(2)});
            const changeWorkflowEventStartVote = await VotingInstance.startVotingSession();
            expectEvent(changeWorkflowEventStartVote, "WorkflowStatusChange", {previousStatus: new BN(2), newStatus: new BN(3)});
            await expectRevert(VotingInstance.setVote(300, {from: account1}), "Proposal not found");
        });

        //cas nominal
        it("should vote be validated", async () => {
            const votedEvent = await VotingInstance.setVote(1, {from: account1});

            const voterData = await VotingInstance.getVoter(account1, {from: account1});
            expect(voterData.isRegistered).to.be.true;
            expect(voterData.hasVoted).to.be.true;
            expect(new BN(voterData.votedProposalId)).to.be.bignumber.equal(new BN(1));

            const proposalDataWithVote = await VotingInstance.getOneProposal(1, {from: account1});
            expect(proposalDataWithVote.description).to.equal("testAlyra2");
            expect(new BN(proposalDataWithVote.voteCount)).to.be.bignumber.equal(new BN(1));

            const proposalDataNoVote = await VotingInstance.getOneProposal(0, {from: account1});
            expect(proposalDataNoVote.description).to.equal("testAlyra1");
            expect(new BN(proposalDataNoVote.voteCount)).to.be.bignumber.equal(new BN(0));

            expectEvent(votedEvent, "Voted", {voter: account1, proposalId: new BN(1)});
        });

        it("should vote only one time", async () => {
            await expectRevert(VotingInstance.setVote(1, {from: account1}), "You have already voted");
        });

    });

    describe("Test tallyVote", function () {

        before(async function () {
            VotingInstance = await VotingTest.new({from: owner});
            // on enregistre 2 voters
            await VotingInstance.addVoter(account1, {from: owner});
            await VotingInstance.addVoter(account2, {from: owner});
            await VotingInstance.addVoter(account3, {from: owner});
            await VotingInstance.startProposalsRegistering();
            // on enregsitre 2 propositions
            await VotingInstance.addProposal("testAlyra1", {from: account1});
            await VotingInstance.addProposal("testAlyra2", {from: account2});

            await VotingInstance.endProposalsRegistering();
            await VotingInstance.startVotingSession();

            // on lance le vote des 3 votants
            await VotingInstance.setVote(1, {from: account1});
            await VotingInstance.setVote(1, {from: account2});
            await VotingInstance.setVote(0, {from: account3});

            console.log("Account owner = [" + owner + "]")
            console.log("Accounts registered = [" + account1 + ", " + account2 + "]")
        });

        it("should be owner to tally", async () => {
            await expectRevert(VotingInstance.tallyVotes({from: account1}), "Ownable: caller is not the owner");
        });

        it("should voting session be ended", async () => {
            await expectRevert(VotingInstance.tallyVotes({from: owner}), "Current status is not voting session ended");
        });

        //cas nominal
        it("should have a winner", async () => {
            const changeWorkflowEventEndVotingSession = await VotingInstance.endVotingSession();
            expectEvent(changeWorkflowEventEndVotingSession, "WorkflowStatusChange", {previousStatus: new BN(3), newStatus: new BN(4)});
            const changeWorkflowEventTallied = await VotingInstance.tallyVotes({from: owner});
            expectEvent(changeWorkflowEventTallied, "WorkflowStatusChange", {previousStatus: new BN(4), newStatus: new BN(5)});
            const winnerProposalId = await VotingInstance.winningProposalID.call();
            expect(new BN(winnerProposalId)).to.be.bignumber.equal(new BN(1));
        });


    });

});