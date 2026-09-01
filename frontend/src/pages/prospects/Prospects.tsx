import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import Layout from "../../components/layout/Layout";

import {
  getProspects,
} from "../../services/prospect.service";

import {
  useAuth,
} from "../../context/AuthContext";


export default function Prospects() {


  const navigate = useNavigate();

  const { user } = useAuth();


  const [prospects,setProspects] = useState<any[]>([]);

  const [loading,setLoading] = useState(true);

  const [error,setError] = useState("");



  const [filters,setFilters] = useState({

    status:"",
    source:""

  });





  useEffect(()=>{

    loadProspects();

  },[]);




  const loadProspects = async()=>{

    try{

      setLoading(true);


      const data = await getProspects(filters);


      setProspects(data);


    }
    catch(e:any){

      setError(
        "Cannot load prospects"
      );

    }
    finally{

      setLoading(false);

    }

  };





  const changeFilter = (e:any)=>{


    setFilters({

      ...filters,

      [e.target.name]:e.target.value

    });


  };




  return (

    <Layout>

      <Box sx={{p:3}}>

        <Paper sx={{p:3}}>


          <Typography
            variant="h4"
            sx={{mb:3}}
          >
            Prospects
          </Typography>


          {
            error &&

            <Alert severity="error">
              {error}
            </Alert>
          }


          <Grid container spacing={2}>


            <Grid size={{xs:12,md:4}}>

              <TextField

                select

                fullWidth

                label="Status"

                name="status"

                value={filters.status}

                onChange={changeFilter}

              >

                <MenuItem value="">
                  All
                </MenuItem>

                <MenuItem value="NEW">
                  NEW
                </MenuItem>

                <MenuItem value="CONTACTED">
                  CONTACTED
                </MenuItem>

                <MenuItem value="QUALIFIED">
                  QUALIFIED
                </MenuItem>

                <MenuItem value="PROPOSAL SENT">
                  PROPOSAL SENT
                </MenuItem>

                <MenuItem value="NEGOTIATION">
                  NEGOTIATION
                </MenuItem>

                <MenuItem value="WON">
                  WON
                </MenuItem>

                <MenuItem value="LOST">
                  LOST
                </MenuItem>


              </TextField>

            </Grid>
                        <Grid size={{xs:12,md:4}}>

              <TextField

                select

                fullWidth

                label="Source"

                name="source"

                value={filters.source}

                onChange={changeFilter}

              >

                <MenuItem value="">
                  All
                </MenuItem>

                <MenuItem value="WEBSITE">
                  WEBSITE
                </MenuItem>

                <MenuItem value="REFERRAL">
                  REFERRAL
                </MenuItem>

                <MenuItem value="COLD CALL">
                  COLD CALL
                </MenuItem>

                <MenuItem value="SOCIAL MEDIA">
                  SOCIAL MEDIA
                </MenuItem>

                <MenuItem value="EVENT">
                  EVENT
                </MenuItem>

                <MenuItem value="OTHER">
                  OTHER
                </MenuItem>

              </TextField>

            </Grid>



            <Grid size={{xs:12,md:4}}>


              <Button

                variant="contained"

                onClick={loadProspects}

              >
                Search
              </Button>



              <Button

                sx={{ml:2}}

                variant="outlined"

                onClick={()=>navigate("/prospects/add")}

              >
                Add Prospect
              </Button>


            </Grid>


          </Grid>





          {
          loading ?

          <Box sx={{p:4}}>

            <CircularProgress/>

          </Box>


          :


          <TableContainer component={Paper} sx={{mt:3}}>


            <Table>


              <TableHead>


                <TableRow>


                  <TableCell>
                    Name
                  </TableCell>


                  <TableCell>
                    Email
                  </TableCell>


                  <TableCell>
                    Phone
                  </TableCell>


                  <TableCell>
                    Status
                  </TableCell>


                  <TableCell>
                    Assigned
                  </TableCell>


                  <TableCell>
                    Actions
                  </TableCell>


                </TableRow>


              </TableHead>




              <TableBody>


              {
                prospects.map((p)=>(


                  <TableRow key={p.id}>


                    <TableCell>

                      {p.first_name}

                      {" "}

                      {p.last_name}

                    </TableCell>



                    <TableCell>
                      {p.email}
                    </TableCell>



                    <TableCell>
                      {p.phone}
                    </TableCell>



                    <TableCell>
                      {p.status}
                    </TableCell>



                    <TableCell>
                      {p.assigned_to || "Not assigned"}
                    </TableCell>




                    <TableCell>


                      <Button

                        size="small"

                        onClick={()=>
                          navigate(`/prospects/${p.id}`)
                        }

                      >
                        Details
                      </Button>





                      <Button

                        size="small"

                        onClick={()=>
                          navigate(`/prospects/${p.id}/edit`)
                        }

                      >
                        Edit
                      </Button>





                      {
                        user?.role === "MANAGER" && (

                          <Button

                            size="small"

                            variant="contained"

                            sx={{ml:1}}

                            onClick={()=>
                              navigate(`/prospects/${p.id}/assign`)
                            }

                          >
                            Assign
                          </Button>

                        )
                      }



                    </TableCell>




                  </TableRow>


                ))
              }



              </TableBody>


            </Table>


          </TableContainer>


          }



        </Paper>


      </Box>


    </Layout>


  );


}