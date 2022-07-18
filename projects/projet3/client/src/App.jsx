import Intro from "./components/Intro/";
import Profile from "./components/Profile";
import Footer from "./components/Footer";
import "./App.css";
import {createClient, WagmiConfig} from 'wagmi'
import {ethers} from 'ethers'
import Admin from "./components/Admin";


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
                    <Admin/>
                    <hr/>
                    <Footer/>
                </WagmiConfig>

            </div>
        </div>
    );
}

export default App;
