const requests=globalThis.__viralRadioRequests||(globalThis.__viralRadioRequests=[]);
export default async function handler(req,res){
 if(req.method!=="POST") return res.status(405).json({message:"Method not allowed"});
 const b=req.body||{}, song=String(b.song||"").trim();
 if(!song) return res.status(400).json({message:"Song title is required."});
 requests.push({name:String(b.name||"").slice(0,80),song,artist:String(b.artist||"").slice(0,100),country:String(b.country||"").slice(0,50),at:new Date().toISOString()});
 return res.status(200).json({message:"✓ Song request sent to Viral Radio."});
}