import {useState} from 'react'
import {ethers} from "ethers"
import {Row, Form, Button, Alert} from 'react-bootstrap'
import {create as ipfsHttpClient} from 'ipfs-http-client'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const Create = ({marketplace, nft, vrf}) => {
    const [creation, setCreation] = useState(false)
    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log("image ipfs", result)
                setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("ipfs image upload error: ", error)
            }
        }
    }
    const createNFT = async () => {
        if (!image || !price || !name || !description) {
            alert('Tous les champs sont obligatoires !');
            return
        }
        try {
            setCreation(true)
            const result = await client.add(JSON.stringify({image, price, name, description}))
            console.log("metadata ipfs", result)
            await mintThenList(result)
        } catch (error) {
            setCreation(false)
            console.log("IPFS uri upload error: ", error)
        }
    }
    const mintThenList = async (result) => {
        const uri = `https://ipfs.infura.io/ipfs/${result.path}`
        // mint nft
        await (await nft.mint(uri)).wait()
        // get tokenId of new nft
        const id = await nft.tokenCount() - 1
        // approve marketplace to spend nft
        await (await nft.setApprovalForAll(marketplace.address, true)).wait()
        // add nft to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()

        setCreation(false)

    }
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{maxWidth: '1000px'}}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS}
                            />
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Nom"/>
                            <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description"/>
                            <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Prix en ETH"/>
                            <div className="d-grid px-0">
                                <Button hidden={creation} onClick={createNFT} variant="primary" size="lg">
                                    Créer et ajouter votre NFT à la MarketPlace !
                                </Button>
                                <Alert hidden={!creation} key='warning' variant='warning'>
                                    Création en cours... veuillez valider les 3 transactions
                                </Alert>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Create