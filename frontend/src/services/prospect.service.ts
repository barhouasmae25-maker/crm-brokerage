import api from "./api";


export const getProspects = async (params?: any) => {

    const response = await api.get("/prospects", {
        params
    });

    return response.data;
};



export const getProspect = async (id:number) => {

    const response = await api.get(`/prospects/${id}`);

    return response.data;
};



export const createProspect = async(data:any)=>{

    const response = await api.post(
        "/prospects",
        data
    );

    return response.data;
};



export const updateProspect = async(
    id:number,
    data:any
)=>{

    const response = await api.put(
        `/prospects/${id}`,
        data
    );

    return response.data;
};



export const assignProspect = async(
    id:number,
    assignedTo:number
)=>{

    const response = await api.put(
        `/prospects/${id}/assign`,
        {
            assignedTo
        }
    );


    return response.data;

};