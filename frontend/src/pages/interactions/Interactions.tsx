import { useEffect, useState } from "react";

import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from "@mui/material";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import Layout from "../../components/layout/Layout";

import {
  getProspectInteractions,
} from "../../services/interaction.service";

import type {
  Interaction,
} from "../../services/interaction.service";


export default function Interactions() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [interactions, setInteractions] =
    useState<Interaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadInteractions = async () => {

    try {

      setLoading(true);

      setError("");


      const data =
        await getProspectInteractions(
          Number(id)
        );


      setInteractions(data);

    } catch (e: any) {

      console.error(e);

      setError(
        e.response?.data?.message ||
        "Cannot load interactions"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadInteractions();

  }, [id]);


  const getOutcomeColor = (
    outcome?: string | null
  ) => {

    switch (outcome) {

      case "POSITIVE":
        return "success";

      case "NEGATIVE":
        return "error";

      case "NO ANSWER":
        return "warning";

      default:
        return "default";

    }

  };


  return (

    <Layout>

      <Box sx={{ p: 3 }}>

        <Paper sx={{ p: 3 }}>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 3
            }}
          >

            <Typography variant="h4">
              Prospect Interactions
            </Typography>


            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  `/prospects/${id}/interactions/add`
                )
              }
            >
              Add Interaction
            </Button>

          </Box>


          {error && (

            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>

          )}


          {loading ? (

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 5
              }}
            >
              <CircularProgress />
            </Box>

          ) : interactions.length === 0 ? (

            <Alert severity="info">
              No interactions found.
            </Alert>

          ) : (

            <TableContainer>

              <Table>

                <TableHead>

                  <TableRow>

                    <TableCell>
                      Type
                    </TableCell>

                    <TableCell>
                      Notes
                    </TableCell>

                    <TableCell>
                      Outcome
                    </TableCell>

                    <TableCell>
                      Next Action
                    </TableCell>

                    <TableCell>
                      Next Action Date
                    </TableCell>

                    <TableCell>
                      Created At
                    </TableCell>

                  </TableRow>

                </TableHead>


                <TableBody>

                  {interactions.map(
                    (interaction) => (

                      <TableRow
                        key={interaction.id}
                      >

                        <TableCell>

                          <Chip
                            label={
                              interaction.type
                            }
                          />

                        </TableCell>


                        <TableCell>
                          {interaction.notes}
                        </TableCell>


                        <TableCell>

                          <Chip
                            label={
                              interaction.outcome ||
                              "N/A"
                            }
                            color={
                              getOutcomeColor(
                                interaction.outcome
                              ) as any
                            }
                          />

                        </TableCell>


                        <TableCell>

                          {
                            interaction.next_action ||
                            "—"
                          }

                        </TableCell>


                        <TableCell>

                          {
                            interaction.next_action_date
                              ? new Date(
                                  interaction.next_action_date
                                ).toLocaleDateString()
                              : "—"
                          }

                        </TableCell>


                        <TableCell>

                          {new Date(
                            interaction.created_at
                          ).toLocaleString()}

                        </TableCell>

                      </TableRow>

                    )
                  )}

                </TableBody>

              </Table>

            </TableContainer>

          )}

        </Paper>

      </Box>

    </Layout>

  );
}