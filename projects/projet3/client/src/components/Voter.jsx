import * as React from "react";
import {useState} from "react";
import {Alert, Box, Button, Chip, Collapse, Grid, IconButton, TextareaAutosize, Typography} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import {useVotingContract} from "../contexts/UseVotingContract";
import {useContractWrite} from "wagmi";

function Voter({workflowStatus, labelWorkflowStatus}) {


    const [proposal, setProposal] = useState('')
    const [openDialogOk, setOpenDialogOk] = useState(false);
    const {contractConfig} = useVotingContract()

    const addProposal = useContractWrite({
        ...contractConfig,
        functionName: 'addProposal',
        onError(error) {
            console.log("Error add proposal", error);
        },
        onSuccess(data) {
            setOpenDialogOk(true)
            setProposal('')
            console.log("Success addProposal", data);
        }
    })


    const addProposals = () => {

        if (proposal) {
            console.log("Ajout proposition : " + proposal);
            addProposal.write({
                args: proposal
            })
        }

    };


    return (
        <React.Fragment>
            <Box sx={{width: '100%'}}>
                <Collapse in={openDialogOk}>
                    <Alert
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setOpenDialogOk(false);
                                }}
                            >
                                <CloseIcon fontSize="inherit"/>
                            </IconButton>
                        }
                        sx={{mb: 2}}
                    >
                        Votre proposition a été prise en compte !
                    </Alert>
                </Collapse>
            </Box>
            <Grid container spacing={5}>
                <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                        Vous êtes un électeur. La session est à <Chip size="medium" color={"primary"}
                                                                      label={labelWorkflowStatus}/>
                    </Typography>
                </Grid>
                {workflowStatus === 1 && <>
                    <Grid item xs={12} sm={6}>
                        <TextareaAutosize
                            required
                            id="proposal"
                            name="proposal"
                            minRows={3}
                            label="Saisir une proposition"
                            style={{width: 400}}
                            variant="standard"
                            value={proposal}
                            onChange={(event) => {
                                setProposal(event.target.value)
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Button variant="contained" onClick={addProposals}>Ajouter</Button>
                    </Grid>
                </>}
            </Grid>
        </React.Fragment>
    )
}

export default Voter;
