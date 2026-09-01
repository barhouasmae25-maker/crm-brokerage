import { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Box
} from "@mui/material";

import Grid from "@mui/material/Grid";

import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout/Layout";

import { createProspect } from "../../services/prospect.service";


export default function AddProspect() {


  const navigate = useNavigate();


  const [loading,setLoading] = useState(false);

  const [error,setError] = useState("");



  const [form,setForm] = useState({

    firstName:"",
    lastName:"",
    email:"",
    phone:"",
    source:"WEBSITE",
    interest:"FOREX",
    estimatedCapital:"",
    notes:""

  });




  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {


    setForm({

      ...form,

      [e.target.name]: e.target.value

    });


  };






  const handleSubmit = async()=>{


    try{


      setError("");



      if(
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        !form.phone
      ){

        setError(
          "Please fill all required fields"
        );

        return;

      }




      setLoading(true);



      await createProspect(form);



      navigate("/prospects");



    }
    catch(err:any){


      setError(

        err.response?.data?.message 
        ||
        "Error creating prospect"

      );


    }
    finally{


      setLoading(false);


    }


  };






  return (


    <Layout>


      <Box
        sx={{
          p:3
        }}
      >



        <Paper

          elevation={3}

          sx={{

            p:4,

            maxWidth:900,

            margin:"auto"

          }}

        >




          <Typography

            variant="h4"

            sx={{

              mb:3

            }}

          >

            Add Prospect

          </Typography>





          {
            error &&

            <Alert

              severity="error"

              sx={{
                mb:3
              }}

            >

              {error}

            </Alert>

          }





          <Grid container spacing={3}>


            <Grid size={{xs:12,md:6}}>


              <TextField

                fullWidth

                label="First Name"

                name="firstName"

                value={form.firstName}

                onChange={handleChange}

              />


            </Grid>





            <Grid size={{xs:12,md:6}}>


              <TextField

                fullWidth

                label="Last Name"

                name="lastName"

                value={form.lastName}

                onChange={handleChange}

              />


            </Grid>






            <Grid size={{xs:12,md:6}}>


              <TextField

                fullWidth

                label="Email"

                type="email"

                name="email"

                value={form.email}

                onChange={handleChange}

              />


            </Grid>







            <Grid size={{xs:12,md:6}}>


              <TextField

                fullWidth

                label="Phone"

                name="phone"

                value={form.phone}

                onChange={handleChange}

              />


            </Grid>









            <Grid size={{xs:12,md:6}}>


              <TextField

                select

                fullWidth

                label="Source"

                name="source"

                value={form.source}

                onChange={handleChange}

              >


                <MenuItem value="WEBSITE">
                  Website
                </MenuItem>


                <MenuItem value="REFERRAL">
                  Referral
                </MenuItem>


                <MenuItem value="COLD CALL">
                  Cold Call
                </MenuItem>


                <MenuItem value="SOCIAL MEDIA">
                  Social Media
                </MenuItem>


                <MenuItem value="EVENT">
                  Event
                </MenuItem>


                <MenuItem value="OTHER">
                  Other
                </MenuItem>


              </TextField>


            </Grid>









            <Grid size={{xs:12,md:6}}>


              <TextField

                select

                fullWidth

                label="Interest"

                name="interest"

                value={form.interest}

                onChange={handleChange}

              >


                <MenuItem value="STOCKS TRADING">
                  Stocks Trading
                </MenuItem>


                <MenuItem value="FOREX">
                  Forex
                </MenuItem>


                <MenuItem value="CRYPTO">
                  Crypto
                </MenuItem>


                <MenuItem value="COMMODITIES">
                  Commodities
                </MenuItem>


                <MenuItem value="OPTIONS">
                  Options
                </MenuItem>


                <MenuItem value="MIXED">
                  Mixed
                </MenuItem>


              </TextField>


            </Grid>








            <Grid size={{xs:12}}>


              <TextField

                fullWidth

                label="Estimated Capital"

                name="estimatedCapital"

                value={form.estimatedCapital}

                onChange={handleChange}

              />


            </Grid>







            <Grid size={{xs:12}}>


              <TextField

                fullWidth

                multiline

                rows={4}

                label="Notes"

                name="notes"

                value={form.notes}

                onChange={handleChange}

              />


            </Grid>



          </Grid>







          <Box

            sx={{

              mt:4,

              display:"flex",

              gap:2

            }}

          >



            <Button

              variant="contained"

              onClick={handleSubmit}

              disabled={loading}

            >


              {

                loading ?

                <CircularProgress size={24}/>

                :

                "Create Prospect"

              }


            </Button>





            <Button

              variant="outlined"

              onClick={()=>navigate("/prospects")}

            >

              Cancel

            </Button>




          </Box>





        </Paper>



      </Box>



    </Layout>


  );

}