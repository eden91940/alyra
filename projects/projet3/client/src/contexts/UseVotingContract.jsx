import {useContract, useProvider} from 'wagmi';

const {abi: VotingABI} = require('../contracts/Voting.json');

export function useVotingContract() {

    const provider = useProvider();
    //const signer = useSigner();

    const config = {
        addressOrName: '0x9C53F90f56243871f95a4c9eC8a2bEE530FF4424',
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