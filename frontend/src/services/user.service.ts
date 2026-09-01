import api from "./api";


export const getAgents = async()=>{

  const res = await api.get("/admin/users");

  return res.data.filter(
    (user:any)=> user.role === "AGENT"
  );

};