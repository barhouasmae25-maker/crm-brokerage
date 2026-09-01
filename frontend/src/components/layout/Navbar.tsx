import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from "@mui/material";

import { useAuth } from "../../context/AuthContext";


export default function Navbar() {

  const navigate = useNavigate();

  const { user } = useAuth();


  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");

  };


  return (

    <AppBar position="static">

      <Toolbar>


        <Typography
          variant="h6"
          sx={{ flexGrow: 1 }}
        >
          CRM Brokerage
        </Typography>



        <Box
          sx={{
            display:"flex",
            gap:2
          }}
        >


          <Button
            color="inherit"
            component={Link}
            to="/dashboard"
          >
            Dashboard
          </Button>



          <Button
            color="inherit"
            component={Link}
            to="/prospects"
          >
            Prospects
          </Button>




          {
            user?.role === "MANAGER" && (

              <Button
                color="inherit"
                component={Link}
                to="/admin/users"
              >
                Users
              </Button>

            )
          }




          <Button
            color="inherit"
            onClick={logout}
          >
            Logout
          </Button>



        </Box>


      </Toolbar>

    </AppBar>

  );

}