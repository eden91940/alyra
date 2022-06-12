//SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.14;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {

    // Électeur qui peut voter et faire des propositions de loi
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }

    // Proposition de loi
    struct Proposal {
        string description;
        uint voteCount;
    }

    // Liste des états du processus de vote
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    struct ProposalSet {
        Proposal[] proposalList;
        // mapping qui contient le hash de la description
        mapping(bytes32 => bool) is_in;
    }

    // état du process de vote
    WorkflowStatus public votingStatus = WorkflowStatus.RegisteringVoters;
    //liste de électeurs validés par l'admin
    mapping(address => Voter) voterMap;
    // set des propositions enregistrées (une description est unique!)
    ProposalSet proposalSet;
    uint voteBlancCount;
    uint proposalIdWinner;
    bool isProcessVoteStrict;

    // Liste de événements
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    //event ProposalRegisteredWithDescription(uint proposalId, string description);
    event Voted(address voter, uint proposalId);
    event VotedBlanc(address voter);

    // Ajout par l'admin uniquement d'un électeur
    function addVoter(address _address) public onlyOwner {
        require(votingStatus == WorkflowStatus.RegisteringVoters, unicode"La période d'enregistrement des électeurs est terminée");
        voterMap[_address] = Voter(true, false, 0);
        emit VoterRegistered(_address);
    }

    // Changement pour un workflow de vote souple ou strict (isProcessVoteStrict = true)
    function toggleProcessVoteStrict(bool _strict) public onlyOwner {
        isProcessVoteStrict = _strict;
    }

    // Changement du statut du processing de vote par l'admin
    function changeVotingStatus(WorkflowStatus newVotingStatus) public onlyOwner {
        WorkflowStatus previousVotingStatus = votingStatus;
        require(votingStatus == WorkflowStatus.VotesTallied, unicode"Les votes sont décomptés à partir de la méthode talyVote()");
        if (isProcessVoteStrict) {
            require(uint(newVotingStatus) > uint(previousVotingStatus), unicode"Impossible de revenir à un état du processus de vote précédent");
        }
        votingStatus = newVotingStatus;
        emit WorkflowStatusChange(previousVotingStatus, newVotingStatus);
    }

    // Ajout d'une nouvelle proposition
    function putNewProposal(string calldata _description) public {
        require(votingStatus == WorkflowStatus.ProposalsRegistrationStarted, unicode"La période d'enregistrement des propositions n'a pas commencé");
        require(voterMap[msg.sender].isRegistered, "Vous ne pouvez pas faire de propositions. Veuillez contacter l'admin du contrat");

        bytes32 hashDescription = keccak256(abi.encodePacked(_description));
        if (!proposalSet.is_in[hashDescription]) {
            proposalSet.proposalList.push(Proposal(_description, 0));
            proposalSet.is_in[hashDescription] = true;
        }
        emit ProposalRegistered(proposalSet.proposalList.length - 1);

        // si on veut utiliser cet event pour stocker via le front la liste de proposition (alternative possible à getAllProposal ?)
        // emit ProposalRegisteredWithDescription(proposalSet.proposalList.length - 1, _description);
    }

    // Récupère toutes les propositions
    function getAllProposal() public view returns (Proposal[] memory) {
        require(uint(votingStatus) >= 2, unicode"La période d'enregistrement des propositions n'est pas terminée");
        return proposalSet.proposalList;
    }

    // Voter pour une proposition
    function voteForProposal(uint proposalId) public {
        require(votingStatus == WorkflowStatus.VotingSessionStarted, unicode"La période de vote n'est pas active");
        require(voterMap[msg.sender].isRegistered, "Vous ne pouvez pas voter. Veuillez contacter l'admin du contrat");
        require(!voterMap[msg.sender].hasVoted, unicode"Vous avez déjà voté !");

        proposalSet.proposalList[proposalId].voteCount++;

        voterMap[msg.sender].votedProposalId = proposalId;
        voterMap[msg.sender].hasVoted = true;

        emit Voted(msg.sender, proposalId);

    }

    function voteBlanc() public {
        require(votingStatus == WorkflowStatus.VotingSessionStarted, unicode"La période de vote n'est pas active");
        require(voterMap[msg.sender].isRegistered, "Vous ne pouvez pas voter. Veuillez contacter l'admin du contrat");
        require(!voterMap[msg.sender].hasVoted, unicode"Vous avez déjà voté !");

        voteBlancCount++;
        voterMap[msg.sender].hasVoted = true;

        emit VotedBlanc(msg.sender);

    }

    // Récupère le vote d'un électeur à partir de son adresse
    function getVoteProposalIdByVoterAddress(address _address) public view returns (uint _proposalId) {
        require(uint(votingStatus) >= 3, unicode"La période de vote n'est pas démarrée");
        require(voterMap[_address].hasVoted, unicode"Cet électeur n'a pas voté");

        return voterMap[_address].votedProposalId;
    }

    // l'admin lance le dépouillement
    function talyVotes() public onlyOwner {
        require(votingStatus == WorkflowStatus.VotingSessionEnded, unicode"La période de vote n'est pas terminée");

        uint maxVote = 0;
        uint _proposalIdWinner;
        for (uint i = 0; i < proposalSet.proposalList.length; i++) {
            if (proposalSet.proposalList[i].voteCount > maxVote) {
                _proposalIdWinner = i;
            }
        }

        proposalIdWinner = _proposalIdWinner;
        votingStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, votingStatus);
    }


    // Récupère la proposition gagnante
    function getWinnerProposal() public view returns (Proposal memory) {
        require(votingStatus == WorkflowStatus.VotesTallied, unicode"Le décompte des votes n'est pas clos");
        return proposalSet.proposalList[proposalIdWinner];
    }

}