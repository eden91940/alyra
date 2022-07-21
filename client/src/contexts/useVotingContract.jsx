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
        addressOrName: '0xFD4c25E880e0BB7a4Bb980F13f62DaCBd7e903D9',
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