import {useContract, useContractWrite, useProvider, useSigner} from 'wagmi';

const {abi: VotingABI} = require('../contracts/Voting.json');

export function useVotingContract() {

    const provider = useProvider();
    const signer = useSigner();

    const config = {
        addressOrName: '0xAAc730919Fb5Ce189EC6838918b158C36F0d4dB6',
        contractInterface: VotingABI,
    };
    const contractProvider = useContract({
        ...config,
        signerOrProvider: provider,
    });

    const contractSigner = useContract({
        ...config,
        signerOrProvider: signer?.data,
    });
    const addVoter = useContractWrite({
        ...config,
        functionName: 'addVoter',
    });


    return {contractConfig: config, addVoter, contractProvider, contractSigner};

}