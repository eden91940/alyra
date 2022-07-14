import { EthProvider } from "./contexts/EthContext";
import Intro from "./components/Intro/";
import Profile from "./components/Profile";
import Demo from "./components/Demo";
import Footer from "./components/Footer";
import "./App.css";
import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultProvider } from 'ethers'

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
})

function App() {
  return (
    <EthProvider>
      <div id="App" >
        <div className="container">
          <Intro />
          <hr />
          <WagmiConfig client={client}>
            <Profile />
          </WagmiConfig>
          <hr />
          <Demo />
          <hr />
          <Footer />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
