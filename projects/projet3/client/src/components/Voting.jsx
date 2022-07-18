import {useAccount, useContractEvent} from 'wagmi'
import * as React from "react";
import {useEffect, useState} from "react";
import {Button, Chip, Grid, TextField, Typography} from "@mui/material";
import {useVotingContract} from "../contexts/UseVotingContract";
import MUIDataTable from "mui-datatables";
import Voter from "./Voter";
import {makeStyles} from "@mui/styles";

export const useStyles = makeStyles(() => ({
    chipCustom: {
        borderRadius: '9px', //some style
        '& .MuiChip-label': {fontSize: 14}, // sub-selector
    },
}));

function Voting() {

    const WorkflowStatus = {
        RegisteringVoters: 0,
        ProposalsRegistrationStarted: 1,
        ProposalsRegistrationEnded: 2,
        VotingSessionStarted: 3,
        VotingSessionEnded: 4,
        VotesTallied: 5
    }


    const chipCustomClass = useStyles();
    const [isOwner, setIsOwner] = useState(false)
    const [winningId, setWinningId] = useState()
    const [workFlowChanging, setWorkFlowChanging] = useState(false)
    const [voter, setVoter] = useState(null)
    const [votersList, setVotersList] = useState([])
    const [workflowStatus, setWorkflowStatus] = useState(null)
    const [labelWorkflowStatus, setLabelWorkflowStatus] = useState(null)
    const [labelNextWorkflowStatus, setLabelNextWorkflowStatus] = useState(null)
    const [voterAddress, setVoterAddress] = useState(null)
    const {address} = useAccount()
    const {contractConfig: config, addVoter, contractProvider, contractSigner} = useVotingContract()
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

    useContractEvent({
        ...config,
        eventName: 'WorkflowStatusChange',
        listener: async (event) => {
            const workflowStatus = await contractProvider.workflowStatus();
            setWorkflowStatus(workflowStatus)
            setLabelWorkflowStatus(getLabelVoteStatus(workflowStatus))
            setLabelNextWorkflowStatus(getLabelVoteAction(workflowStatus))
            setWorkFlowChanging(false);
        }
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

                    //on vérifie si on est un électeur
                    await contractSigner.getVoter(address).then((voter) => {
                        setVoter(voter)
                    }).catch(function (e) {
                        console.error("Vous ne pouvez pas voter");
                    })

                    //on récupère le status du workflow
                    const workflowStatus = await contractProvider.workflowStatus();
                    setWorkflowStatus(workflowStatus)
                    setLabelWorkflowStatus(getLabelVoteStatus(workflowStatus))
                    setLabelNextWorkflowStatus(getLabelVoteAction(workflowStatus))

                    if (workflowStatus == 5) {
                        const winningId = await contractProvider.winningProposalID();
                        setWinningId(winningId.toNumber());
                    }


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
        [address, contractProvider, contractSigner]
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


    function getLabelVoteStatus(workflowStatus) {
        switch (workflowStatus) {
            case WorkflowStatus.RegisteringVoters:
                return "Enregistrement des votants";
            case WorkflowStatus.ProposalsRegistrationStarted:
                return "Enregistrement des propositions";
            case WorkflowStatus.ProposalsRegistrationEnded:
                return "Fin des enregistrements des propositions";
            case WorkflowStatus.VotingSessionStarted:
                return "Vote demarré";
            case WorkflowStatus.VotingSessionEnded:
                return "Vote terminé";
            case WorkflowStatus.VotesTallied:
                return "Dépouillement effectué";
            default:
                return "en attente des infos du contrat";
        }
    }

    function getLabelVoteAction(workflowStatus) {
        switch (workflowStatus) {
            case WorkflowStatus.RegisteringVoters:
                return "Enregistrer les propositions";
            case WorkflowStatus.ProposalsRegistrationStarted:
                return "Terminer l'enregistrement des propositions";
            case WorkflowStatus.ProposalsRegistrationEnded:
                return "Démarrer le vote";
            case WorkflowStatus.VotingSessionStarted:
                return "Mettre fin au vote";
            case WorkflowStatus.VotingSessionEnded:
                return "Lancer le dépouillement";
            default:
                return "en attente des infos du contrat";
        }
    }

    async function changeToNextWorkFlowStatus() {

        setWorkFlowChanging(true)
        switch (workflowStatus) {
            case WorkflowStatus.RegisteringVoters:
                contractSigner.startProposalsRegistering().then((tx) => {
                }).catch(function (e) {
                    setWorkFlowChanging(false);
                    console.error(e);
                    alert("Le changement d'état n'a pas été effectué")
                })
                break
            case WorkflowStatus.ProposalsRegistrationStarted:
                contractSigner.endProposalsRegistering().then((tx) => {
                }).catch(function (e) {
                    setWorkFlowChanging(false);
                    console.error(e);
                    alert("Le changement d'état n'a pas été effectué")
                })
                break
            case WorkflowStatus.ProposalsRegistrationEnded:
                contractSigner.startVotingSession().then((tx) => {
                }).catch(function (e) {
                    setWorkFlowChanging(false);
                    console.error(e);
                    alert("Le changement d'état n'a pas été effectué")
                })
                break
            case WorkflowStatus.VotingSessionStarted:
                contractSigner.endVotingSession().then((tx) => {
                }).catch(function (e) {
                    setWorkFlowChanging(false);
                    console.error(e);
                    alert("Le changement d'état n'a pas été effectué")
                })
                break
            case WorkflowStatus.VotingSessionEnded:
                contractSigner.tallyVotes().then((tx) => {
                }).catch(function (e) {
                    setWorkFlowChanging(false);
                    console.error(e);
                    alert("Le changement d'état n'a pas été effectué")
                })
                break
            default:
                console.error("changement d'étape impossible")
        }

    }

    return (
        <React.Fragment>
            {
                (() => {
                    if (isOwner) {
                        return (
                            <React.Fragment>
                                <Grid container spacing={5}>
                                    <Grid item xs={12}>
                                        <Typography variant="h5" gutterBottom>
                                            Vous êtes <strong>propriétaire du contrat</strong> et la session est à <Chip className={chipCustomClass.chipCustom} size="medium"
                                                                                                                         color={"primary"}
                                                                                                                         label={labelWorkflowStatus}/>

                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} hidden={workflowStatus > 4}>
                                        Passer à l'étape <Button variant="contained" disabled={workFlowChanging}
                                                                 onClick={() => {
                                                                     changeToNextWorkFlowStatus()
                                                                 }}>{labelNextWorkflowStatus}</Button>
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
                                    <Grid item xs={12} hidden={workflowStatus != 5}>
                                        Le vote est clos et la proposition gagnante est la <strong>{winningId}</strong>
                                    </Grid>
                                </Grid>
                                <hr/>
                                {voter && voter.isRegistered &&
                                    <Voter voter={voter} workflowStatus={workflowStatus} labelWorkflowStatus={labelWorkflowStatus} winningId={winningId}/>
                                }
                            </React.Fragment>
                        )
                    } else if (address && voter && voter.isRegistered) {
                        return (
                            <Voter voter={voter} workflowStatus={workflowStatus} labelWorkflowStatus={labelWorkflowStatus} winningId={winningId}/>
                        )
                    } else if (address) {
                        return <div>Vous n'êtes pas enregistré sur le projet Voting</div>;
                    } else {
                        return <div>Veuillez vous connecter</div>;
                    }
                })()
            }
        </React.Fragment>
    )
}

export default Voting;
