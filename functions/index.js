const functions = require('firebase-functions');
const {Client} = require("@googlemaps/google-maps-services-js");
const cors = require('cors')({
    origin:'*',
  });


exports.placeAutocomplete = functions.https.onRequest((req, res) => {

    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', '*');

    let query = req.headers['text'];
    console.log(query)
    
    /*
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', '*');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        } else {
            let query = req.headers['text'];
            let data;
            
            const client = new Client({});
        
            client.placeAutocomplete(query)
                .then((r) => {
                    data = r.data.predictions;
                    res.send(data)
                    return data
                })
                .catch((e) => {
                    console.log(e.response.data.error_message);
                })
        }
        */
 });
