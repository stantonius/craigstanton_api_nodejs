/**
 * File contains multiple functions
 * The first is for autocomplet
 * The second takes the placeId of the selected value provided by autocomple
 * and then gets further details (in this can we care about long & lat).
 * Both use the API key stored in Firebase
 */

const functions = require('firebase-functions');
const {Client} = require("@googlemaps/google-maps-services-js");


exports.placeAutocomplete = functions
    .region('europe-west2')
    .https.onRequest(async (req, res) => {

        res.set('Access-Control-Allow-Origin', '*');
      
        if (req.method === 'OPTIONS') {
          // Send response to OPTIONS requests
          res.set('Access-Control-Allow-Methods', 'GET');
          res.set('Access-Control-Allow-Headers', '*');
          res.set('Access-Control-Max-Age', '3600');
          res.status(204).send('');
        } else {
            
            const client = new Client({});

            const result = await client.placeAutocomplete({params: {
                key: functions.config().googleplaces.key,
                input: req.headers['text']
            }})
                .then((value) => {
                    let values = []
                    value.data.predictions.forEach((pred) => {
                       values.push(
                           {
                               "description": pred.description,
                               "placeId": pred.place_id,
                           }
                       ) 
                    })
                    return res.send(values)
                })
        }
 });


exports.placeDetails = functions.region('europe-west2').https.onRequest(async (req, res) => {
   
    res.set('Access-Control-Allow-Origin', '*');
      
    if (req.method === 'OPTIONS') {
      // Send response to OPTIONS requests
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', '*');
      res.set('Access-Control-Max-Age', '3600');
      res.status(204).send('');
    } else {
        
        const client = new Client({});

        await client.placeDetails({
            params: {
                key: functions.config().googleplaces.key,
                place_id: req.headers['placeid']
            }
        }).then((value) => {
            return res.send(
                {
                    "lat": value.data.result.geometry.location.lat,
                    "lng": value.data.result.geometry.location.lng
                }
            )
        }).catch((e) => {
            return res.send(`Error getting location values: ${e}`)
        })
    }
})
