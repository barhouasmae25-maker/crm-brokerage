import { useState } from "react";

import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Alert
} from "@mui/material";

import { useNavigate, useParams } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import {
  createProspectInteraction
} from "../../services/interaction.service";

import type {
  InteractionType,
  InteractionOutcome
} from "../../services/interaction.service";


export default function AddInteraction() {

  const { id } = useParams();

  const navigate = useNavigate();


  const [type, setType] =
    useState<InteractionType>("CALL");

  const [notes, setNotes] =
    useState("");

  const [outcome, setOutcome] =
    useState<InteractionOutcome>("POSITIVE");

  const [nextAction, setNextAction] =
    useState("");

  const [nextActionDate, setNextActionDate] =
    useState("");


  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const save = async () => {

    try {

      setLoading(true);

      setError("");


      if (!notes.trim()) {

        setError(
          "Notes are required"
        );

        return;
      }


      await createProspectInteraction(
        Number(id),
        {
          type,
          notes,
          outcome,

          nextAction:
            nextAction || undefined,

          nextActionDate:
            nextActionDate || undefined
        }
      );


      navigate(
        `/prospects/${id}/interactions`
      );


    } catch (e: any) {

      console.error(e);

      setError(
        e.response?.data?.message ||
        "Cannot create interaction"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <Layout>

      <Box sx={{ p: 3 }}>

        <Paper
          sx={{
            p: 4,
            maxWidth: 700,
            mx: "auto"
          }}
        >

          <Typography
            variant="h4"
            sx={{ mb: 3 }}
          >
            Add Interaction
          </Typography>


          {error && (

            <Alert
              severity="error"
              sx={{ mb: 3 }}
            >
              {error}
            </Alert>

          )}


          <TextField
            select
            fullWidth
            label="Interaction Type"
            value={type}
            onChange={(e) =>
              setType(
                e.target.value as InteractionType
              )
            }
            sx={{ mb: 3 }}
          >

            <MenuItem value="CALL">
              CALL
            </MenuItem>

            <MenuItem value="EMAIL">
              EMAIL
            </MenuItem>

            <MenuItem value="MEETING">
              MEETING
            </MenuItem>

            <MenuItem value="SMS">
              SMS
            </MenuItem>

            <MenuItem value="NOTE">
              NOTE
            </MenuItem>

          </TextField>


          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            sx={{ mb: 3 }}
          />


          <TextField
            select
            fullWidth
            label="Outcome"
            value={outcome}
            onChange={(e) =>
              setOutcome(
                e.target.value as InteractionOutcome
              )
            }
            sx={{ mb: 3 }}
          >

            <MenuItem value="POSITIVE">
              POSITIVE
            </MenuItem>

            <MenuItem value="NEUTRAL">
              NEUTRAL
            </MenuItem>

            <MenuItem value="NEGATIVE">
              NEGATIVE
            </MenuItem>

            <MenuItem value="NO ANSWER">
              NO ANSWER
            </MenuItem>

          </TextField>


          <TextField
            fullWidth
            label="Next Action"
            value={nextAction}
            onChange={(e) =>
              setNextAction(e.target.value)
            }
            sx={{ mb: 3 }}
          />


          <TextField
  fullWidth
  type="date"
  label="Next Action Date"
  value={nextActionDate}
  onChange={(e) => setNextActionDate(e.target.value)}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
  sx={{ mb: 3 }}
/>


          <Button
            variant="contained"
            onClick={save}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Interaction"}
          </Button>


          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() =>
              navigate(
                `/prospects/${id}/interactions`
              )
            }
          >
            Cancel
          </Button>

        </Paper>

      </Box>

    </Layout>
  );
}