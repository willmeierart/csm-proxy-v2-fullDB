require('dotenv').config()
const express = require('express');
const router = express.Router();
const queries = require('../db/queries')
const fetch = require('node-fetch')
const VIMEO = 'https://player.vimeo.com/video/'
const VIMEO_API = 'https://api.vimeo.com'
const {Vimeo} = require('vimeo')
const {CLIENT_ID} = process.env
const {CLIENT_SECRET} = process.env
const {ACCESS_TOKEN} = process.env
const lib = new Vimeo(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN)

router.get('/', (req,res)=>{
  queries.getAllVideos().then(videos=>res.json(videos))
})

router.get('/:id', (req,res,next)=>{
  queries.getVideo(req.params.id).then(videos=>{
    const fail = {} || undefined || [] || '' || null
    const foundVid = res.json(videos)[0]
    console.log('foundVid', foundVid);
    if(foundVid || req.params.id == foundVid.id){
      return foundVid
    } else {
      const bigReq = fetchMP4(req.params.id).then(res=>res)
      .then(data=>{
        const precise = data.map((item)=>{
          if (item){return item.sort(
            (a,b)=>{return b.width-a.width})}
        })
        const HQobj = {HD:precise[0][0],thumb:precise[1][0],captions:precise[2]}
        return HQobj
      }).then(obj=>{
        const postVid = {
          vimeo_id:req.params.id,
          entire_json:JSON.stringify(obj)
        }
        return queries.addVideo(postVid).then(video=>{
          res.json(video)
          // if(video){
          //   return queries.getVideo(req.params.id)
          //   .then(vid=>{return res.json(vid)[0]})
          //   .catch(err=>console.log('err',err))
          // }
          // else{next(new Error('error'))}
        })
      }).catch(err=>console.log('err', err))
      return bigReq
    }
  })
})

router.get('/:id/captions',(req,res,next)=>{
  fetch(`${VIMEO_API}/videos/${req.params.id}/texttracks`, {method:'GET', headers:{Authorization:`Bearer ${ACCESS_TOKEN}`}})
  .then(res=>{
    console.log(res);
    return res.json()}).then(json=>{
    console.log(json);
    return res.json(json)})
})

router.delete('/:id', (req,res,next)=>{
  queries.deleteVideo(req.params.id).then(()=>{res.json({deleted:true})})
})

function fetchMP4(id){
  return fetch(`${VIMEO_API}/videos/${id}`, {method:'GET', headers:{Authorization:`Bearer ${ACCESS_TOKEN}`}})
  .then((res)=>{
    return res.json()
    .then((body)=>{
      let validData = [body.files, body.pictures.sizes]
      if(body.metadata.connections.texttracks){
        const captionsPath = body.metadata.connections.texttracks.uri
        return fetch(`${VIMEO_API}${captionsPath}`, {method:'GET', headers:{Authorization:`Bearer ${ACCESS_TOKEN}`}})
        .then((result)=>{return result.json()
          .then((captions)=>{
            const CAPS = captions.data.map((cap)=>{
              return [{file:cap.link,url:`https://player.vimeo.com${cap.uri}`}]
            })
            validData = validData.concat(CAPS)
            console.log('captions.data',captions.data);
            return validData
          }
          )})
      } else {return validData}
    })
  })
}

function postMP4(){

}

module.exports=router

// async function fetchMP4(id){
//   const initialReq = await fetch(`${VIMEO_API}/videos/${id}`, {method:'GET', headers:{Authorization:`Bearer ${ACCESS_TOKEN}`}})
//   const validData = await [initialReq.files, initialReq.pictures.sizes]
//   if(initialReq.metadata.connections.texttracks){
//     const captionsPath = await [initialReq]
//   }
// }



// router.post('/',(req,res,next)=>{
//   queries.addVideo()
// })

// router.put('/:id',(req,res,next)=>{
//   queries.updateVideo()
// })
