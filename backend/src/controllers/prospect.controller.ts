import { Response } from "express";

import {
  createProspect,
  getProspects,
  getProspectById,
  updateProspect,
  assignProspect
} from "../services/prospect.service.js";



/*
====================================
CREATE PROSPECT
POST /api/prospects
====================================
*/

export const create = async(
  req:any,
  res:Response
)=>{

try{

const prospect =
await createProspect(
  req.body,
  req.user.id
);


res.status(201).json(prospect);


}catch(error:any){

res.status(400).json({
 message:error.message
});


}

};





/*
====================================
GET ALL
GET /api/prospects

filters:
?status=NEW
?source=WEBSITE
====================================
*/

export const getAll = async(
 req:any,
 res:Response
)=>{

try{


const prospects =
await getProspects(
 req.user,
 req.query
);


res.json(prospects);



}catch(error:any){

res.status(400).json({
 message:error.message
});


}


};






/*
====================================
GET ONE
GET /api/prospects/:prospectId
====================================
*/

export const getOne = async(
req:any,
res:Response
)=>{


try{


const prospect =
await getProspectById(
 Number(req.params.prospectId),
 req.user
);



res.json(prospect);



}catch(error:any){


res.status(404).json({
 message:error.message
});


}



};






/*
====================================
UPDATE

PUT /api/prospects/:prospectId
====================================
*/

export const update = async(
req:any,
res:Response
)=>{


try{


const prospect =
await updateProspect(
 Number(req.params.prospectId),
 req.body,
 req.user
);


res.json(prospect);



}catch(error:any){


res.status(400).json({
 message:error.message
});


}


};







/*
====================================
ASSIGN

PUT /api/prospects/:prospectId/assign

MANAGER ONLY
====================================
*/

export const assign = async(
req:any,
res:Response
)=>{


try{


const prospect =
await assignProspect(
 Number(req.params.prospectId),
 req.body.assignedTo
);



res.json(prospect);



}catch(error:any){


res.status(400).json({
 message:error.message
});


}



};