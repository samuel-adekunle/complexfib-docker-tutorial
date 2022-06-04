import {BrowserRouter as Router, Route, Link, Routes} from "react-router-dom";
import Fib from "./Fib";
import OtherPage from "./OtherPage";


function Home() {
    return <div>
        <header>
            <h1>Learn react!</h1>
            <div>
                <Link to="/">Home</Link>
            </div>
            <div>
                <Link to="/otherpage">Other Page</Link>
            </div>
        </header>
    </div>
}

function App() {
    return <Router>
        <Home/>
        <Routes>
            <Route exact path="/" element={<Fib/>}/>
            <Route path="/otherpage" element={<OtherPage/>}/>
        </Routes>
    </Router>
}

export default App;
