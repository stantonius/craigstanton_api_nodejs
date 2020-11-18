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
