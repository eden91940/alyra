import {useContract, useProvider} from 'wagmi';

const {abi: VotingABI} = require('../contracts/Voting.json');

export function useVotingContract() {

    const provider = useProvider();
    /*const {signer} = useSigner({
    onSuccess(data) {
        console.log('Success', data)
    },
})
    const [networkSelected, setNetworkSelected] = useState()
    provider.getNetwork().then((network) => {
        setNetworkSelected(network)
    })

*/
    const config = {
        addressOrName: '0x2dDFae451d7a1058F227B007541Bb310e43e3d57',
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