import {useAccount, useContractEvent} from 'wagmi'
import * as React from "react";
import {useEffect, useState} from "react";
import {Button, Grid, TextField, Typography} from "@mui/material";
import {useVotingContract} from "../contexts/UseVotingContract";
import MUIDataTable from "mui-datatables";

function Admin() {

    const [isOwner, setIsOwner] = useState(false)
    const [votersList, setVotersList] = useState([])
    const [voterAddress, setVoterAddress] = useState(null)
    const {address} = useAccount()
    const {contractConfig: config, addVoter, contract} = useVotingContract()
    const columns = ["Adresse"];

    useContractEvent({
        ...config,
        eventName: 'VoterRegistered',
        listener: (event) => {
            console.log(event)
            console.log(votersList)
            // 👇️ push to end of state array
            setVotersList(current => [...current, event.slice(0, event.length - 1)]);
        },
    })


    // Rendu initial du composant
    useEffect(
        // On veut recup les infos du contrat déployé au moment du montage du composant
        // Pour ça on doit déclarer une fonction async dans le hook useEffect
        () => {
            async function setUpWeb3() {
                try {
                    const ownerAddress = await contract.owner();
                    /*          const winningId = await contractVoting.winningProposalID();
                              console.log(winningId)*/
                    setIsOwner(ownerAddress === address)

                    let eventFilter = contract.filters.VoterRegistered()
                    let eventsVotersRegistered = await contract.queryFilter(eventFilter)

                    setVotersList(eventsVotersRegistered.map(({args}) => {
                        return [args[0]];
                    }))


                } catch (error) {
                    alert(
                        `Failed to load web3, accounts, or contract. Check console for details.`,
                    );
                    console.error(error);
                }
                ;
            };

            // On doit executer la fonction async
            setUpWeb3();
        },
        [address, contract]
    );

    const addVoters = () => {

        if (voterAddress) {
            console.log("Ajout adresse : " + voterAddress);
            addVoter.write({
                args: voterAddress,
                onError(error) {
                    console.log("Error", error);
                },
                onSuccess(data) {
                    console.log("Success", data);
                }
            });
        }

    };


    if (isOwner)
        return (
            <React.Fragment>
                <Typography variant="h6" gutterBottom>
                    Vous êtes propriétaire du contrat
                </Typography>
                <Grid container spacing={5}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            inputProps={{pattern: "^0x[a-fA-F0-9]{40}$"}}
                            id="address"
                            name="address"
                            label="Adresse d'un électeur"
                            fullWidth
                            autoComplete="shipping address"
                            variant="standard"
                            onChange={(event) => {
                                setVoterAddress(event.target.value)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button variant="contained" onClick={addVoters}>Ajouter</Button>
                    </Grid>
                    <Grid item xs={12}>
                        <MUIDataTable
                            title={"Liste des votants"}
                            data={votersList}
                            columns={columns}
                        />
                    </Grid>
                </Grid>

            </React.Fragment>
        )
    return <div>Vous n'êtes pas propriétaire du contrat</div>
}

export default Admin;
