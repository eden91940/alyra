import {useContract, useContractWrite, useProvider} from 'wagmi';

const {abi: VotingABI} = require('../contracts/Voting.json');

export function useVotingContract() {

    const provider = useProvider();
    //const signer = useSigner();

    const config = {
        addressOrName: '0x47f1B920F2aC91618fEf35a20e1A95E107385Faf',
        contractInterface: VotingABI,
    };
    const contractProvider = useContract({
        ...config,
        signerOrProvider: provider,
    });

    const contractSigner = useContract({
        ...config,
        signerOrProvider: provider.getSigner(),
    });

    const addVoter = useContractWrite({
        ...config,
        functionName: 'addVoter',
    });
    

    return {contractConfig: config, addVoter, contractProvider, contractSigner};

}