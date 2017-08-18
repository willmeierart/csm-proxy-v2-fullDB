const express = require('express')
const router = express.Router()
require('dotenv').config()
const fetch = require('node-fetch')

const API_URL = process.env.API_URL

async function fetchData(){
  const res = await fetch(API_URL)
  return await res.json()
}

router.get('/', function(req, res) {
  fetchData().then(json=>{
    return res.json(json)})
  .catch(err=>console.log(err))
})

module.exports = router
