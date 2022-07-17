import {useAccount, useConnect, useDisconnect} from 'wagmi'
import {InjectedConnector} from 'wagmi/connectors/injected'
import {Button, Grid, Typography} from "@mui/material";

function Profile() {
    const {address} = useAccount()
    const {connect} = useConnect({
        connector: new InjectedConnector(),
    })
    const {disconnect} = useDisconnect()

    if (address)
        return (
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Typography variant="h5">Vous êtes connecté avec le compte <strong>{address}</strong></Typography>
                </Grid>
                <Grid item xs={4}>
                    <Button variant="contained" onClick={() => disconnect()}>Se déconnecter</Button>
                </Grid>
            </Grid>
        )
    return <Button variant="contained" onClick={() => connect()}>Se connecter à votre wallet</Button>
}

export default Profile;
