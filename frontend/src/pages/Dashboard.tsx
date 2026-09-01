import {
  useEffect,
  useState
} from "react";

import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

import { useAuth } from "../context/AuthContext";

import {
  getAgentDashboard,
  getManagerDashboard,
  getDashboardTasks
} from "../services/dashboard.service";

import type {
  DashboardData,
  DashboardTask
} from "../services/dashboard.service";

export default function Dashboard() {

  const { user } = useAuth();

  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [tasks, setTasks] =
    useState<DashboardTask[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        setLoading(true);
        setError("");

        if (!user) {
          setError("Utilisateur non connecté.");
          return;
        }

        let dashboardData: DashboardData;

        if (user.role === "MANAGER") {

          dashboardData =
            await getManagerDashboard();

        } else {

          dashboardData =
            await getAgentDashboard();
        }

        setDashboard(dashboardData);

        const tasksData =
          await getDashboardTasks();

        setTasks(tasksData);

      } catch (err: any) {

        console.error(
          "DASHBOARD ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
          "Impossible de récupérer les données du dashboard."
        );

      } finally {

        setLoading(false);
      }
    };

    loadDashboard();

  }, [user]);

  if (loading) {

    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "400px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {

    return (
      <Box
        sx={{
          width: "100%",
          padding: 3
        }}
      >
        <Card>
          <CardContent>
            <Typography
              sx={{
                color: "error.main"
              }}
            >
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!dashboard) {

    return (
      <Box sx={{ padding: 3 }}>
        <Typography>
          Aucune donnée disponible.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        padding: 3,
        boxSizing: "border-box"
      }}
    >

      <Box
        sx={{
          marginBottom: 3
        }}
      >

        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700
          }}
        >
          Dashboard
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            marginTop: 1
          }}
        >
          Vue d'ensemble de votre activité CRM
        </Typography>

      </Box>

      <Grid
        container
        spacing={3}
      >

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}
        >
          <Card>
            <CardContent>

              <Typography
                color="text.secondary"
              >
                Total Prospects
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginTop: 1
                }}
              >
                {dashboard.prospects.total}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}
        >
          <Card>
            <CardContent>

              <Typography
                color="text.secondary"
              >
                Prospects WON
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginTop: 1
                }}
              >
                {dashboard.prospects.won}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}
        >
          <Card>
            <CardContent>

              <Typography
                color="text.secondary"
              >
                Taux de conversion
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginTop: 1
                }}
              >
                {dashboard.conversionRate}%
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}
        >
          <Card>
            <CardContent>

              <Typography
                color="text.secondary"
              >
                Total Clients
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginTop: 1
                }}
              >
                {dashboard.clients.total}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}
        >
          <Card>
            <CardContent>

              <Typography
                color="text.secondary"
              >
                Clients actifs
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginTop: 1
                }}
              >
                {dashboard.clients.active}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}
        >
          <Card>
            <CardContent>

              <Typography
                color="text.secondary"
              >
                Clients inactifs
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  marginTop: 1
                }}
              >
                {dashboard.clients.inactive}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12
          }}
        >
          <Card>
            <CardContent>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: 2
                }}
              >
                Total Balance
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700
                }}
              >
                {Number(
                  dashboard.totalBalance
                ).toLocaleString(
                  "fr-FR",
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </Typography>

            </CardContent>
          </Card>
        </Grid>

      </Grid>

      <Card
        sx={{
          marginTop: 3
        }}
      >

        <CardContent>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              marginBottom: 2
            }}
          >
            Prospects par statut
          </Typography>

          <TableContainer
            component={Paper}
          >

            <Table>

              <TableHead>

                <TableRow>

                  <TableCell>
                    Statut
                  </TableCell>

                  <TableCell align="right">
                    Nombre
                  </TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {dashboard.prospects.byStatus.map(
                  (item) => (

                    <TableRow
                      key={item.status}
                    >

                      <TableCell>
                        {item.status}
                      </TableCell>

                      <TableCell align="right">
                        {item.count}
                      </TableCell>

                    </TableRow>

                  )
                )}

              </TableBody>

            </Table>

          </TableContainer>

        </CardContent>

      </Card>

      <Card
        sx={{
          marginTop: 3
        }}
      >

        <CardContent>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              marginBottom: 2
            }}
          >
            Demandes par statut
          </Typography>

          <TableContainer
            component={Paper}
          >

            <Table>

              <TableHead>

                <TableRow>

                  <TableCell>
                    Statut
                  </TableCell>

                  <TableCell align="right">
                    Nombre
                  </TableCell>

                </TableRow>

              </TableHead>

              <TableBody>

                {dashboard.accountRequests.byStatus.map(
                  (item) => (

                    <TableRow
                      key={item.status}
                    >

                      <TableCell>
                        {item.status}
                      </TableCell>

                      <TableCell align="right">
                        {item.count}
                      </TableCell>

                    </TableRow>

                  )
                )}

              </TableBody>

            </Table>

          </TableContainer>

        </CardContent>

      </Card>

      <Card
        sx={{
          marginTop: 3
        }}
      >

        <CardContent>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              marginBottom: 2
            }}
          >
            Actions à faire
          </Typography>

          {tasks.length === 0 ? (

            <Typography
              color="text.secondary"
            >
              Aucune action à faire.
            </Typography>

          ) : (

            <TableContainer
              component={Paper}
            >

              <Table>

                <TableHead>

                  <TableRow>

                    <TableCell>
                      Nom
                    </TableCell>

                    <TableCell>
                      Type
                    </TableCell>

                    <TableCell>
                      Prochaine action
                    </TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {tasks.map((task) => {

                    const isProspect =
                      task.prospect_id !== null;

                    const firstName =
                      isProspect
                        ? task.prospect_first_name
                        : task.client_first_name;

                    const lastName =
                      isProspect
                        ? task.prospect_last_name
                        : task.client_last_name;

                    return (

                      <TableRow
                        key={task.id}
                      >

                        <TableCell>
                          {firstName || "-"}{" "}
                          {lastName || ""}
                        </TableCell>

                        <TableCell>
                          {
                            isProspect
                              ? "Prospect"
                              : "Client"
                          }
                        </TableCell>

                        <TableCell>
                          {
                            new Date(
                              task.next_action_date
                            ).toLocaleString(
                              "fr-FR"
                            )
                          }
                        </TableCell>

                      </TableRow>

                    );
                  })}

                </TableBody>

              </Table>

            </TableContainer>

          )}

        </CardContent>

      </Card>

    </Box>
  );
}