import {Typography} from "@mui/material";

function Link({uri, text}) {
    return (<> <Typography>Version 0.1.0 <a href={uri} target="_blank" rel="noreferrer">{text}</a></Typography></>
    )
}

function Footer() {
    return (
        <footer>
            <Link uri={"https://github.com/eden91940/alyra/tree/main/projects/projet3"} text={"GitHub"}/>
        </footer>
    );
}

export default Footer;
