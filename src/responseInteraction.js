const colors = require('colors/safe');
const fetch = require("node-fetch");

const wppResponse = async (client) => {
    await client.onMessage(async (message) => {
    console.log(colors.rainbow('========================================================================='))
        
     try {
            console.log(message)
            if(message.content.toLocaleLowerCase() == 'abracadabra') abracadabra(message.from.replace('@c.us',''))
            
            if(message.type !== 'list_response') return

            const id = await message.listResponse.singleSelectReply.selectedRowId.split('-')
            console.log(colors.yellow.bold(id))

      
            var UserNumberSender = message.from.replace('@c.us','')
           

            if(UserNumberSender.length < 13) UserNumberSender = [UserNumberSender.slice(0,4),'9',UserNumberSender.slice(4)].join('')

            console.log(colors.blue.bold(UserNumberSender))
            console.log(colors.red.bold(message.content))
           

            if(id[0] === 'activate') await  activeSquedule(UserNumberSender, id[1])
            if(id[0] === 'reserve')  await  queroReservar(UserNumberSender, id[1])
            if(id[0] === 'stop')     await  pararReceber(UserNumberSender, id[1])

        } catch (e) {
             const error = `Error: enviar menssagem ao usuario: ${message.from} / ${message.content}\n${e}`
             errorSendDIscord(error)
            console.log(colors.red.bold(e))
        }        
    console.log(colors.rainbow('========================================================================='))
    });
}

/*=====================================================================*/
const activeSquedule = async (number,id) => {

    const datas = JSON.stringify({
                                    phone   : number,
                                    message : "Sua cotação foi reativada com sucesso",
                                    isGroup : false
                                })
   const schedule = `{
                       "status": "A"
                     }`

   const scheduleUp = await executeFetch(`schedule/${id}`,schedule,'PUT',1).catch(e => false)

   if(scheduleUp.code !== 1 || !scheduleUp) erroMessage(number)
   if(scheduleUp.code !== 1 || !scheduleUp) return

    const res = await executeFetch('send-message',datas,'POST',0)
    console.log(colors.green.bold(res))
}

/*=====================================================================*/
const queroReservar = async (number,id) => {

    const datas = JSON.stringify({
                                    phone     : number,
                                    message   : "🎯que demais! dentro de alguns instantes uma pessoa agente de viagens fará contato com você. obrigado por viajar com o mala.",
                                    isGroup   : false
                                })
   const schedule = `{
                       "status": "D"
                     }`

   const scheduleUp = await executeFetch(`schedule/${id}`,schedule,'PUT',1).catch(e => false)

   if(scheduleUp.code !== 1 || !scheduleUp) erroMessage(number)
   if(scheduleUp.code !== 1 || !scheduleUp) return

   await executeFetch('send-message',datas,'POST',0)
   
}
/*=====================================================================*/
const pararReceber = async (number,id) => {

    const datas = JSON.stringify({
                                    phone   : number,
                                    message : "ok, tiramos sua viagem de sua rotina de busca 🥹 conte sempre com o mala.",
                                    isGroup : false
                                })
   
    const schedule = `{
                       "status": "D"
                      }`

   const scheduleUp = await executeFetch(`schedule/${id}`,schedule,'PUT',1).catch(e => false)
   console.log(scheduleUp)
   if(scheduleUp.code !== 1 || !scheduleUp) erroMessage(number)
   if(scheduleUp.code !== 1 || !scheduleUp) return

   const res = await executeFetch('send-message',datas,'POST',0)

}

/*=====================================================================*/
const erroMessage = async (number) => {
     
    errorSendDIscord(`Agenda não encontrada\ncontato:${number}`)

    const datas = JSON.stringify({
                                    phone   : number,
                                    message : "ops, tivemos um imprevisto, nossos agentes de viagens já estão resolvendo 😉",
                                    isGroup : false
                                })
   const res = await executeFetch('send-message',datas,'POST',0)
   console.log(colors.green.bold(res))
}
/*=====================================================================*/
const abracadabra = async (number) => {
    if(number.length < 13)number = [number.slice(0,4),'9',number.slice(4)].join('')
    console.log(number)
    const res = await executeFetch(`schedule/lessmonth/${number}`,'','GET',1).catch(e => e)
    console.log(res)
    if(!res || res.content.length == 0) return
    
    const schedule = await res.content.reduce((prev,e) =>{
                                                            var date = e.data_ida.split("-").reverse().join("/")
                                                                date = date.replace(date.slice(6,11),date.slice(8,11))
                                                            return [...prev,{rowId: `activate-${e.id}`,
                                                                             title:`saída ${date} de ${e.cidade_origem.toLocaleLowerCase()}➡️${e.cidade_destino.toLocaleLowerCase()}`}]
                                                         },[])
    
    const buttonsWpp = JSON.stringify(
      {
        isGroup: false,
        phone: number,
        buttonText: "CLIQUE AQUI",
        description: "clique no botão para visualizar suas cotações desativadas",
        sections: [
          {
            title: "selecione a cotação que deseja reativar",
            rows:  schedule 
          }
        ]
      }
    )

    
    
      await executeFetch('send-list-message',buttonsWpp,'POST',0)
}
/*=====================================================================*/
const executeFetch = async (param, datas = '',method = 'GET',destiny) =>{
  const url = [ 
                'http://159.223.169.173:21465/api/omala/',
                'https://api-tw3.omala.com.br/'
              ]
  const token = [
                 "$2b$10$kwdDx4iLjZz27hrZPDHOaONpiPQhmK7hbtG9e9Cxb4JTFe2SQDG6a",
                 "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJtYWxlcm8tdG91cmluZyIsInN1YiI6IkRpc2NvcmQiLCJhdWQiOiI2IiwiaWF0IjoiMTY2MTQ2ODYwNiIsImV4cCI6IjE2OTMwMDQ2MDYifQ.Te7_reuv-1qAeQIIDnU7m3xvxAjalvVGNp64P_ewQdU"
                ]
  const options = {
    method: method,
    headers: {
      'Content-type': 'application/json',
      'Authorization' : `Bearer ${token[destiny]}`,
    },
  };

  if(method !== 'GET') options.body = datas;  

  const req  = await fetch(url[destiny]+param, options).catch(e => errorSendDIscord(e))
  const json = await req.json();
  console.log(json)
  const back = !json.code   ? false : (json.code == 1 ? true : false)
  const wpp  = !json.status ? false : (json.status == 'success' ? true : false)
  if(!back && !wpp) return errorSendDIscord(json,param)
  return json;
}

const errorSendDIscord = (e,param) =>{
    var error = e
    if(e.error)    error = e.error
    if(e.message)  error = e.message
    
    let now = new Date
    let hr  = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
        now = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}` 
    
    console.log(`${error}\n${param}`)

    const options = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(
          {
            content : "━━━━━━━━━━━━━━━━━━━━━━━━━🔴 **wpp error** 🔴━━━━━━━━━━━━━━━━━━━━━━━━━\n",
            username: "wpp alerts",
            avatar_url: "",
            embeds: [
              {
                author: {
                  name: "wppconnect-server backend",
                  "icon_url" : "https://i.imgur.com/JtPeMI1.png"
                },
                title: "testee",
                description: "Error occurred on **wppconnect-server**\nresponseInteraction.js",
                fields: [
                  {
                    name: "Date",
                    value: now,
                    inline: true
                  },
                  {
                    name: "Time",
                    value: hr,
                    inline: true
                  },
                  {
                    name: "Error message",
                    value: `${error}\n${param}`
              
                  }
                ],
                // footer: {
                //   text: "There are always a million reasons not to do something."
                // }
              }
            ]
          }                       
     )
          
    };
  
      fetch('https://discordapp.com/api/webhooks/1016335037337186354/Jw8KyQLDzuGGba22B4Fazu_CT6R2Fj_lVy5oL-owuuiVhxhbg1iLe6tVd9IuPQzuEFFx',options).then(resp => resp).then(resp =>{
  
           console.log('*****',resp)
  
      }).catch(e => console.log('#',e))

      return false
        
  }

module.exports = {
    wppResponse
}
