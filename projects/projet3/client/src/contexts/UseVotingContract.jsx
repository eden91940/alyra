import {useContract, useContractWrite, useProvider} from 'wagmi';

const {abi: VotingABI} = require('../contracts/Voting.json');

export function useVotingContract() {

    const provider = useProvider();
    const config = {
        addressOrName: '0xAAc730919Fb5Ce189EC6838918b158C36F0d4dB6',
        contractInterface: VotingABI,
    };
    const contract = useContract({
        ...config,
        signerOrProvider: provider,
    });
    const addVoter = useContractWrite({
        ...config,
        functionName: 'addVoter',
    });


    return {contractConfig: config, addVoter, contract};

}