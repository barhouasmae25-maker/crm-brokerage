import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

import Layout from "../../components/layout/Layout";

import {
  getProspect,
} from "../../services/prospect.service";


export default function ProspectDetails() {

  const { id } = useParams();

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [prospect, setProspect] =
    useState<any>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");


  // =====================================================
  // LOAD PROSPECT
  // =====================================================

  useEffect(() => {

    const loadProspect = async () => {

      try {

        setLoading(true);

        setError("");


        const prospectId =
          Number(id);


        if (Number.isNaN(prospectId)) {

          throw new Error(
            "Invalid prospect ID"
          );

        }


        const data =
          await getProspect(prospectId);


        console.log(
          "PROSPECT DATA:",
          data
        );

        console.log(
          "PROSPECT STATUS:",
          data.status
        );


        setProspect(data);


      } catch (err: any) {

        console.error(
          "GET PROSPECT ERROR:",
          err
        );


        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Cannot load prospect"
        );


      } finally {

        setLoading(false);

      }

    };


    loadProspect();

  }, [id]);


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <Layout>

        <Box
          sx={{
            p: 5,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >

          <CircularProgress />

        </Box>

      </Layout>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <Layout>

        <Box sx={{ p: 3 }}>

          <Alert severity="error">
            {error}
          </Alert>

        </Box>

      </Layout>

    );

  }


  // =====================================================
  // PROSPECT NOT FOUND
  // =====================================================

  if (!prospect) {

    return (

      <Layout>

        <Box sx={{ p: 3 }}>

          <Alert severity="warning">
            Prospect not found
          </Alert>

        </Box>

      </Layout>

    );

  }


  // =====================================================
  // STATUS
  // =====================================================

  const status =
    String(prospect.status)
      .trim()
      .toUpperCase();


  // =====================================================
  // ACCOUNT REQUEST BUSINESS RULE
  //
  // Only QUALIFIED prospect can create
  // an account request.
  // =====================================================

  const canCreateAccountRequest =
    status === "QUALIFIED";


  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getStatusColor = () => {

    switch (status) {

      case "WON":
        return "success";

      case "LOST":
        return "error";

      case "QUALIFIED":
        return "info";

      case "CONTACTED":
        return "warning";

      case "NEGOTIATION":
        return "secondary";

      default:
        return "default";

    }

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <Layout>

      <Box
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >

        <Paper
          elevation={2}
          sx={{
            p: {
              xs: 2,
              md: 4,
            },

            maxWidth: 900,

            mx: "auto",

            borderRadius: 2,
          }}
        >


          {/* =================================================
              HEADER
          ================================================= */}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },

              flexDirection: {
                xs: "column",
                sm: "row",
              },

              gap: 2,

              mb: 3,
            }}
          >

            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
              }}
            >

              {prospect.first_name}

              {" "}

              {prospect.last_name}

            </Typography>


            <Chip
              label={prospect.status}
              color={getStatusColor() as any}
            />

          </Box>


          <Divider sx={{ mb: 3 }} />


          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Contact Information
          </Typography>


          <Typography sx={{ mb: 1 }}>

            📧 <strong>Email:</strong>{" "}

            {prospect.email}

          </Typography>


          <Typography sx={{ mb: 1 }}>

            📞 <strong>Phone:</strong>{" "}

            {prospect.phone}

          </Typography>


          <Divider sx={{ my: 3 }} />


          {/* =================================================
              PROSPECT INFORMATION
          ================================================= */}

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Prospect Information
          </Typography>


          <Typography sx={{ mb: 1 }}>

            <strong>Source:</strong>{" "}

            {prospect.source}

          </Typography>


          <Typography sx={{ mb: 1 }}>

            <strong>Interest:</strong>{" "}

            {prospect.interest}

          </Typography>


          <Typography sx={{ mb: 1 }}>

            <strong>Estimated Capital:</strong>{" "}

            {prospect.estimated_capital ??
              "-"}

          </Typography>


          <Typography sx={{ mb: 1 }}>

            <strong>Assigned To:</strong>{" "}

            {prospect.assigned_to ??
              "Not assigned"}

          </Typography>


          <Divider sx={{ my: 3 }} />


          {/* =================================================
              LAST CONTACT
          ================================================= */}

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Contact History
          </Typography>


          <Typography sx={{ mb: 2 }}>

            <strong>
              Last Contact Date:
            </strong>{" "}

            {prospect.last_contact_date
              ? new Date(
                  prospect.last_contact_date
                ).toLocaleString()
              : "No contact yet"}

          </Typography>


          {/* =================================================
              NOTES
          ================================================= */}

          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontWeight: 600,
            }}
          >
            Notes
          </Typography>


          <Typography
            sx={{
              mb: 3,
              color: "text.secondary",
              whiteSpace: "pre-wrap",
            }}
          >

            {prospect.notes ||
              "No notes"}

          </Typography>


          <Divider sx={{ mb: 3 }} />


          {/* =================================================
              ACTIONS
          ================================================= */}

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
            }}
          >
            Actions
          </Typography>


          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
            }}
          >


            {/* =================================================
                EDIT PROSPECT
            ================================================= */}

            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  `/prospects/${prospect.id}/edit`
                )
              }
            >

              Edit Prospect

            </Button>


            {/* =================================================
                INTERACTIONS
            ================================================= */}

            <Button
              variant="outlined"
              onClick={() =>
                navigate(
                  `/prospects/${prospect.id}/interactions`
                )
              }
            >

              Interactions

            </Button>


            {/* =================================================
                ACCOUNT REQUEST
            ================================================= */}

            {canCreateAccountRequest && (

              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  navigate(
                    `/account-requests/add?prospectId=${prospect.id}`
                  )
                }
              >

                Create Account Request

              </Button>

            )}


            {/* =================================================
                BACK
            ================================================= */}

            <Button
              variant="text"
              onClick={() =>
                navigate("/prospects")
              }
            >

              Back to Prospects

            </Button>

          </Box>


          {/* =================================================
              BUSINESS MESSAGES
          ================================================= */}

          {status === "QUALIFIED" && (

            <Alert
              severity="info"
              sx={{ mt: 3 }}
            >

              This prospect is qualified and can
              create an account opening request.

            </Alert>

          )}


          {status === "WON" && (

            <Alert
              severity="success"
              sx={{ mt: 3 }}
            >

              This prospect has already become a
              client.

            </Alert>

          )}


          {status === "LOST" && (

            <Alert
              severity="warning"
              sx={{ mt: 3 }}
            >

              This prospect is marked as lost and
              cannot create an account request.

            </Alert>

          )}

        </Paper>

      </Box>

    </Layout>

  );

}