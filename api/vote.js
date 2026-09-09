const votes=globalThis.__viralRadioVotes||(globalThis.__viralRadioVotes=new Map());
export default async function handler(req,res){
 if(req.method!=="POST") return res.status(405).json({message:"Method not allowed"});
 const song=String((req.body||{}).song||"").trim(), id=String((req.body||{}).id||"").trim();
 if(!song||!id) return res.status(400).json({message:"Song and listener ID are required."});
 const key=id+"|"+song;
 if(votes.has(key)) return res.status(200).json({message:"You already voted for this song."});
 votes.set(key,Date.now());
 return res.status(200).json({message:"✓ Vote recorded for "+song});
}