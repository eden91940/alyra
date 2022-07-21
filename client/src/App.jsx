import Intro from "./components/Intro";
import Profile from "./components/Profile";
import Footer from "./components/Footer";
import "./App.css";
import {createClient, WagmiConfig} from 'wagmi'
import {ethers} from 'ethers'
import Voting from "./components/Voting";


const client = createClient({
    autoConnect: true,
    provider: new ethers.providers.Web3Provider(window.ethereum),
})

function App() {

    return (
        <div id="App">
            <div className="container">
                <WagmiConfig client={client}>
                    <Intro/>
                    <hr/>
                    <Profile/>
                    <hr/>
                    <Voting/>
                    <hr/>
                    <Footer/>
                </WagmiConfig>

            </div>
        </div>
    );
}

export default App;
