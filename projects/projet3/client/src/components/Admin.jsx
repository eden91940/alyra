import {useAccount, useContractEvent} from 'wagmi'
import * as React from "react";
import {useCallback, useEffect, useState} from "react";
import {Button, Chip, Grid, TextField, Typography} from "@mui/material";
import {useVotingContract} from "../contexts/UseVotingContract";
import MUIDataTable from "mui-datatables";

function Admin() {

    const WorkflowStatus = {
        RegisteringVoters: 0,
        ProposalsRegistrationStarted: 1,
        ProposalsRegistrationEnded: 2,
        VotingSessionStarted: 3,
        VotingSessionEnded: 4,
        VotesTallied: 5
    }

    const [isOwner, setIsOwner] = useState(false)
    const [workFlowChanging, setWorkFlowChanging] = useState(false)
    const [votersList, setVotersList] = useState([])
    const [workflowStatus, setWorkflowStatus] = useState(null)
    const [voterAddress, setVoterAddress] = useState(null)
    const {address} = useAccount()
    const {contractConfig: config, addVoter, contractProvider} = useVotingContract()
    const columns = ["Adresse"];

    // Permet d'écouter un event d'enregistrement d'un voter pour mettre à jour le tableau
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
        // On veut recupérer les infos du contrat déployé au moment du montage du composant
        // Pour ça on doit déclarer une fonction async dans le hook useEffect
        () => {
            async function setUpWeb3() {

                try {
                    //on vérifie si on est propriétaire
                    const ownerAddress = await contractProvider.owner();
                    setIsOwner(ownerAddress === address)

                    //on récupère le status du workflow
                    const workflowStatus = await contractProvider.workflowStatus();
                    setWorkflowStatus(workflowStatus)
                    //setLabelWorkflowStatus(getLabelVoteStatus(workflowStatus))

                    // on récupère tous les votants enregistrés via l'event VoterRegistered
                    let eventFilter = contractProvider.filters.VoterRegistered()
                    let eventsVotersRegistered = await contractProvider.queryFilter(eventFilter)
                    setVotersList(eventsVotersRegistered.map(({args}) => {
                        return [args[0]];
                    }))


                } catch (error) {
                    alert(`Failed to load web3, accounts, or contract. Check console for details.`,);
                    console.error(error);
                }
            }

            // On doit executer la fonction async
            setUpWeb3();
        },
        [address, contractProvider]
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

    const getLabelVoteStatus = useCallback((workflowStatus) => {
        switch (workflowStatus) {
            case WorkflowStatus.RegisteringVoters:
                return "en cours d'enregistrement des votants";
            case WorkflowStatus.ProposalsRegistrationStarted:
                return "en cours d'enregistrements des propositions";
            case WorkflowStatus.ProposalsRegistrationEnded:
                return "fin des d'enregistrements des propositions";
            default:
                return "en attente des infos du contrat";
        }
    }, []);

    async function changeToNextWorkFlowStatus() {
        setWorkFlowChanging(true)
        let changeDone = false
        switch (workflowStatus) {
            case WorkflowStatus.RegisteringVoters:
                contractProvider.startProposalsRegistering().then((tx) => {
                    changeDone = true;
                }).catch(function (e) {
                    console.error(e);
                    alert("Le changement d'état n'a pas été effectué")
                }).finally(setWorkFlowChanging(false))
            /*      case WorkflowStatus.ProposalsRegistrationStarted:
                      tx = await contract.endProposalsRegistering();
                      default
      */
        }

        if (changeDone) {
            const newWorkflowStatus = await contractProvider.workflowStatus();
            setWorkflowStatus(newWorkflowStatus)
            // setLabelWorkflowStatus(getLabelVoteStatus(newWorkflowStatus))
        }

    }


    if (isOwner)
        return (
            <React.Fragment>

                <Grid container spacing={5}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Vous êtes propriétaire du contrat et la session est <Chip size="medium" color={"primary"}
                                                                                      label={getLabelVoteStatus(workflowStatus)}/>

                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        Passer à l'étape <Button variant="contained" disabled={workFlowChanging}
                                                 onClick={changeToNextWorkFlowStatus}>{getLabelVoteStatus(workflowStatus + 1)}</Button>
                    </Grid>
                    {workflowStatus === 0 && <>
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
                    </>}
                    <Grid item xs={12}>
                        <MUIDataTable
                            title={"Liste des votants"}
                            data={votersList}
                            columns={columns}
                            options={{
                                selectableRows: "none", // <===== will turn off checkboxes in rows
                                filter: false // <===== will turn off checkboxes in rows
                            }}
                        />
                    </Grid>
                </Grid>

            </React.Fragment>
        )
    return <div>Vous n'êtes pas propriétaire du contrat</div>
}

export default Admin;
