import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";
import { useSnackbar } from "notistack";


export const config = {
  endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};


function App() {

  const { enqueueSnackbar } = useSnackbar(); 
  const location = useLocation();

  return (
    <Switch className="App">
      <Route exact path="/" component={Products} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {localStorage.getItem('username') ?
        <Route path="/checkout" component={Checkout} />
        : (location.pathname === "/checkout" && enqueueSnackbar('You must be logged in to access checkout page', {variant: "warning"}))
      }
      <Route path="/thanks" component={Thanks} />
    </Switch>
  );
}

export default App;
