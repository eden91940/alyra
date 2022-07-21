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
        addressOrName: '0xd3Ff69dAceeA740360Ce69b1fb515BD165C22F71',
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