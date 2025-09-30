import Main from "./components/main/main";
import Rewards from "./components/rewards/rewards";
import Login from "./components/login/login";
import Signup from "./components/signup/signup";
import { Routes, Route } from "react-router-dom";
import Big from "./components/big/big";
import Settings from "./components/settings/settings";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Big />}></Route>
      <Route path="/main" element={<Main />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}

export default App;
