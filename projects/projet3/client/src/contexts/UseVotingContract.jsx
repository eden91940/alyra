import {useContract, useProvider} from 'wagmi';

const {abi: VotingABI} = require('../contracts/Voting.json');

export function useVotingContract() {

    const provider = useProvider();
    //const signer = useSigner();

    const config = {
        addressOrName: '0x0B54f39C7eB926faA2B8bc2d559BF1041F61C540',
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


    return {contractConfig: config, contractProvider, contractSigner};

}