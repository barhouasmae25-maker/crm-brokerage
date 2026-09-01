import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";

import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,

        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar />

      <List>

        <ListItemButton
          onClick={() => navigate("/dashboard")}
        >
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton
          onClick={() => navigate("/prospects")}
        >
          <ListItemText primary="Prospects" />
        </ListItemButton>

        <ListItemButton
          onClick={() => navigate("/prospects/add")}
        >
          <ListItemText primary="Add Prospect" />
        </ListItemButton>

        <ListItemButton
          onClick={() => navigate("/agent/clients")}
        >
          <ListItemText primary="Clients" />
        </ListItemButton>

      </List>

    </Drawer>
  );
}