import {useEffect,useState} from "react";

import {
useParams,
useNavigate
} from "react-router-dom";


import {
Box,
Paper,
Typography,
Button,
TextField,
MenuItem,
Alert
} from "@mui/material";


import Layout from "../../components/layout/Layout";


import {
assignProspect
} from "../../services/prospect.service";


import {
getAgents
} from "../../services/user.service";





export default function AssignProspect(){


const {id}=useParams();

const navigate=useNavigate();


const [agents,setAgents]=useState<any[]>([]);


const [agent,setAgent]=useState("");

const [error,setError]=useState("");





useEffect(()=>{


getAgents()

.then(setAgents)

.catch((err:any)=>{

console.log("GET AGENTS ERROR:", err.response?.data);
console.log("STATUS:", err.response?.status);

setError(
err.response?.data?.message ||
"Cannot load agents"
);

});


},[]);






const save=async()=>{


try{


await assignProspect(

Number(id),

Number(agent)

);


navigate("/prospects");


}
catch(e:any){


setError(

e.response?.data?.message ||

"Assign failed"

);


}



};







return (

<Layout>


<Box sx={{p:3}}>


<Paper

sx={{

p:4,

maxWidth:600,

mx:"auto"

}}

>


<Typography

variant="h4"

sx={{mb:3}}

>

Assign Prospect

</Typography>




{
error &&

<Alert severity="error">

{error}

</Alert>

}





<TextField

select

fullWidth

label="Agent"

value={agent}

onChange={(e)=>setAgent(e.target.value)}

>


{
agents.map((a)=>(


<MenuItem

key={a.id}

value={a.id}

>

{a.email}

</MenuItem>


))

}


</TextField>





<Button

variant="contained"

sx={{mt:3}}

disabled={!agent}

onClick={save}

>

Assign

</Button>




<Button

variant="outlined"

sx={{mt:3,ml:2}}

onClick={()=>navigate("/prospects")}

>

Cancel

</Button>



</Paper>


</Box>


</Layout>


);


}