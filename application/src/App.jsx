import { Route, Routes } from "react-router-dom";
import { Navbar, Welcome, Footer, Services, Transactions } from "./components";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ExchangePage from "./pages/ExchangePage";

const Home = () => (
  <>
    <div className="gradient-bg-welcome">
      <Welcome />
    </div>
    <Services />
    <Transactions />
  </>
);

const App = () => (
  <div className="min-h-screen">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/exchange" element={<ExchangePage />} />
    </Routes>
    <Footer />
  </div>
);

export default App;
