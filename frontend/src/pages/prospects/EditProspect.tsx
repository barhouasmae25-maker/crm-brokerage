import { useEffect, useState } from "react";
import {
  useParams,
  useNavigate
} from "react-router-dom";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material";

import Grid from "@mui/material/Grid";

import Layout from "../../components/layout/Layout";

import {
  getProspect,
  updateProspect
} from "../../services/prospect.service";


export default function EditProspect(){


const {id}=useParams();

const navigate=useNavigate();


const [loading,setLoading]=useState(true);

const [saving,setSaving]=useState(false);

const [error,setError]=useState("");



const [form,setForm]=useState<any>({

 firstName:"",
 lastName:"",
 email:"",
 phone:"",
 source:"",
 interest:"",
 status:"",
 estimatedCapital:"",
 notes:""

});





useEffect(()=>{


load();


},[]);





const load=async()=>{

try{

const data=await getProspect(Number(id));

setForm({

 firstName:data.first_name,
 lastName:data.last_name,
 email:data.email,
 phone:data.phone,
 source:data.source,
 interest:data.interest,
 status:data.status,
 estimatedCapital:data.estimated_capital || "",
 notes:data.notes || ""

});


}
catch(e){

setError("Cannot load prospect");

}
finally{

setLoading(false);

}


};






const change=(e:any)=>{

setForm({

...form,

[e.target.name]:e.target.value

});


};






const save=async()=>{


try{

setSaving(true);

await updateProspect(
 Number(id),
 form
);


navigate("/prospects");


}
catch(e:any){

setError(
 e.response?.data?.message ||
 "Update failed"
);

}
finally{

setSaving(false);

}


};





if(loading){

return (

<Layout>

<Box sx={{p:4}}>

<CircularProgress/>

</Box>

</Layout>

)

}




return (

<Layout>


<Box sx={{p:3}}>


<Paper

sx={{

p:4,

maxWidth:900,

mx:"auto"

}}

>


<Typography

variant="h4"

sx={{mb:3}}

>

Edit Prospect

</Typography>



{
error &&

<Alert severity="error">

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

onChange={change}

/>

</Grid>



<Grid size={{xs:12,md:6}}>

<TextField

fullWidth

label="Last Name"

name="lastName"

value={form.lastName}

onChange={change}

/>

</Grid>




<Grid size={{xs:12,md:6}}>

<TextField

fullWidth

label="Phone"

name="phone"

value={form.phone}

onChange={change}

/>

</Grid>




<Grid size={{xs:12,md:6}}>

<TextField

fullWidth

label="Email"

value={form.email}

disabled

/>

</Grid>





<Grid size={{xs:12,md:6}}>


<TextField

select

fullWidth

label="Status"

name="status"

value={form.status}

onChange={change}

>


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





<Grid size={{xs:12}}>

<TextField

fullWidth

multiline

rows={4}

label="Notes"

name="notes"

value={form.notes}

onChange={change}

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

onClick={save}

disabled={saving}

>


{

saving ?

<CircularProgress size={22}/>

:

"Save Changes"

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