import {useAccount, useConnect, useDisconnect} from 'wagmi'
import {InjectedConnector} from 'wagmi/connectors/injected'
import {Button, Grid, Typography} from "@mui/material";
import {useEffect, useState} from "react";

function Profile() {
    const {address} = useAccount()
    const {connect} = useConnect({
        connector: new InjectedConnector(),
    })
    const {disconnect} = useDisconnect()
    const [accountAddress, setAccountAddress] = useState()

    useEffect(
        // On veut recupérer les infos du contrat déployé au moment du montage du composant
        // Pour ça on doit déclarer une fonction async dans le hook useEffect
        () => {
            setAccountAddress(address)
        }, [address, accountAddress])

    if (accountAddress)
        return (
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Typography variant="h5">Vous êtes connecté avec le compte <strong>{accountAddress}</strong></Typography>
                </Grid>
                <Grid item xs={4}>
                    <Button variant="contained" onClick={() => disconnect()}>Se déconnecter</Button>
                </Grid>
            </Grid>
        )
    return <Button variant="contained" onClick={() => connect()}>Se connecter à votre wallet</Button>
}

export default Profile;
