import {useContract, useContractWrite, useProvider} from 'wagmi';

const {abi: VotingABI} = require('../contracts/Voting.json');

export function useVotingContract() {

    const provider = useProvider();
    //const signer = useSigner();

    const config = {
        addressOrName: '0x6BD7B7ace3f24BA33785113361DF0Fd1EA3F7dEA',
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