export async function GET(){
  return Response.json({
    ok:true,
    service:"gbk-ai-global-learning",
    version:"4.0.0",
    tutorApi:true,
    spokenEnglishFlow:true,
    productionAIConfigured:Boolean(process.env.AI_PROVIDER_API_KEY)
  })
}
