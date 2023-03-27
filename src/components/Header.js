import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import { useHistory } from "react-router-dom";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {

  const history = useHistory();


  return (
    <Box className="header">
      <Box className="header-title">
        <img src="logo_light.svg" alt="QKart-icon"></img>
      </Box>
      {children && (
        <Box className="search"
        >{children}</Box>)}
        
      <Box className="header-action">
        {hasHiddenAuthButtons ? (
          (localStorage.getItem('username') !== null) ? (
            <Stack direction="row" spacing={2}>
              <Avatar className="profile-image" src="avatar.png" alt={localStorage.getItem('username')} />
              <div class="username-div">{localStorage.getItem('username')}</div>
              <Button
                className="logout-button"
                variant="text"
                onClick={() => {
                  localStorage.clear();
                  history.push("/");
                  window.location.reload();
                }}
              >
                LOGOUT
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2}>
              <Button
                className="login-button"
                variant="text"
                onClick={() => { history.push("/login", { from: "Products" }) }}
              >
                LOGIN
              </Button>
              <Button
                className="register-button"
                variant="contained"
                onClick={() => { history.push("/register", { from: "Products" }) }}
              >
                REGISTER
              </Button>
            </Stack>
          )
        ) : (
          <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text"
            onClick={() => { history.push("/", {}) }}
          >
            Back to explore
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Header;
