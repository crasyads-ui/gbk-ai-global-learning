function localCheck(message,language){
  let corrected=message.trim().replace(/\s+/g," ");
  let label="Good effort";
  let explanation="Your sentence is understandable. Repeat it once more with a clear, natural rhythm.";

  const rules=[
    [/\bi am agree\b/gi,"I agree","Use 'I agree' instead of 'I am agree'."],
    [/\bmyself ([a-z]+)/gi,"I am $1","For introductions, say 'I am …' rather than 'Myself …'."],
    [/\bi have went\b/gi,"I have gone","After 'have', use the past participle 'gone'."],
    [/\bhe go\b/gi,"he goes","With 'he', use 'goes' in the present simple."],
    [/\bshe go\b/gi,"she goes","With 'she', use 'goes' in the present simple."]
  ];

  for(const[r,repl,why] of rules){
    if(r.test(corrected)){
      corrected=corrected.replace(r,repl);
      label="Grammar correction";
      explanation=why+" Practice the corrected sentence aloud.";
      break;
    }
  }

  if(!/[.!?]$/.test(corrected)) corrected+=".";

  return {
    corrected,
    label,
    explanation,
    reply:`${label}: ${corrected}`,
    language,
    mode:"local-fallback"
  };
}

export async function POST(request){
  try{
    const {
      message,
      language="English",
      goal="Spoken English"
    }=await request.json();

    if(!message?.trim()){
      return Response.json(
        {reply:"Please say or type a sentence first."},
        {status:400}
      );
    }

    const key=process.env.AI_PROVIDER_API_KEY;
    const url=process.env.AI_PROVIDER_URL;

    if(key && url){
      const upstream=await fetch(url,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${key}`
        },
        body:JSON.stringify({
          message,
          language,
          goal,
          instruction:
            "Act as a multilingual English speaking coach. Return JSON with corrected, label, explanation, reply. Explain corrections in the learner's selected language while keeping corrected English in English."
        })
      });

      if(upstream.ok){
        const data=await upstream.json();
        return Response.json({...data,mode:"ai"});
      }
    }

    return Response.json(localCheck(message,language));

  }catch{
    return Response.json(
      {reply:"Tutor request could not be processed."},
      {status:500}
    );
  }
}
