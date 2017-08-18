const express = require('express')
const router = express.Router()
require('dotenv').config()
const fetch = require('node-fetch')

const API_URL = process.env.API_URL

// async function fetchData(){
//   const res = await fetch(API_URL)
//   const json = await res.json()
//   return json
// }

router.get('/', function(req, res) {
  function fetchData(){
    return fetch(API_URL)
    .then((res)=>{
      return res.json().then((json)=> json)
    })
  }
  fetchData().then(json=>{
    return res.json(json)})
  .catch(err=>console.log(err))
})

module.exports = router
