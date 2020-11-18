# NodeJS API Cloud Function

### What does this do?

Takes a request from Flutter web and calls the Google Places Autocomplete API using Cloud Function as a middleware.

### Why am I even bothering with this?

- Because you cannot call the Google Places Autocomplete API in [Flutter web](https://stackoverflow.com/questions/61170862/xmlhttprequest-error-with-flutter-web-using-google-places-api-firebase-hosting). CORS blocks this and because I don't control the API server side, I cannot override this. Therefore I had to create a middleware/proxy using functions for the API to work on Flutter web.

### Why did I continue with this approach instead of using Python and FastAPI which I had working already?

- Until now, I had just used Node cloud functions for Dialogflow webhooks and IoT triggers. So I wanted to ensure I had a refresher on both Node and Cloud Functions.

## Dev notes

- When creating a cloud function, always **return** a response. Otherwise the services subscribing to them will wait, and the function will time out. A response ends the function. See the [official docs](https://firebase.google.com/docs/functions/http-events#terminate_http_functions) for reference on this topic

* Google requries authentication by default. You must override the permissions and set `allUsers` to the access policy in GCP cloud functions.

* Start firebase emulators for testing locally by running `firebase emulators:start`

* We are storing API keys using the [Firebase environmental config setup](https://firebase.google.com/docs/functions/config-env#set_environment_configuration_for_your_project). Set (`firebase functions:config:set`), get (`firebase functions:config:get`), and use (`functions.config().keyidentifier.key`)

## CORS - the bane of my web existance

This is by far the most annoying concept I have had to understand and troubleshoot. And by troubleshoot I mean try a thousand things until something works. So for future reference, below is what I learnt.

Also to point out - all of this information is in the official documentation. However I do find it difficult to wade through all of the info in these official manuals to get to the answer. Sometimes I just want a medium post with a recipe-style tutorial and answer. But I digress...

- CORS is **set by the server**. There is no better explanation than the [Mozilla docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) on CORS, which states:

  > Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any other origins (domain, protocol, or port) than its own from which a browser should permit loading of resources. CORS also relies on a mechanism by which browsers make a “preflight” request to the server hosting the cross-origin resource, in order to check that the server will permit the actual request. In that preflight, the browser sends headers that indicate the HTTP method and headers that will be used in the actual request.

- Requests are allowed if the client (webpage) and the server have the **same domain** - ie. the same _origin_. These is totally obvious given the title, but it is important for one of Google's solutions below.

There are 3 options I can see to address CORS for NodeJS cloud functions acting as APIs. The [official documentation](https://cloud.google.com/functions/docs/writing/http#handling_cors_requests) outlines 2 of them

1. Setting the rules directly on the response. This example is from the [official documentation](https://firebase.google.com/docs/functions/http-events#using_existing_express_apps)

```javascript
exports.corsEnabledFunctionAuth = (req, res) => {
  // Set CORS headers for preflight requests
  // Allows GETs from origin https://mydomain.com with Authorization header

  res.set("Access-Control-Allow-Origin", "https://mydomain.com");
  res.set("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Authorization");
    res.set("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  } else {
    res.send("Hello World!");
  }
};
```

- Note that the two important lines are `allow-origin` and `allow-headers` - I had to assign these as wildcards in order for my code to work.

2. Using an npm library and Express. This requires writing your function a little differently than above (using the `app` as an argument for `onRequest`) - this is an example from the [Firebase docs](https://firebase.google.com/docs/functions/http-events#using_existing_express_apps)

```javascript
const express = require("express");
const cors = require("cors");

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
app.use(myMiddleware);

// build multiple CRUD interfaces:
app.get("/:id", (req, res) => res.send(Widgets.getById(req.params.id)));
app.post("/", (req, res) => res.send(Widgets.create()));
app.put("/:id", (req, res) =>
  res.send(Widgets.update(req.params.id, req.body))
);
app.delete("/:id", (req, res) => res.send(Widgets.delete(req.params.id)));
app.get("/", (req, res) => res.send(Widgets.list()));

// Expose Express API as a single Cloud Function:
exports.widgets = functions.https.onRequest(app);
```

3. Use the same domain for the cloud function and site hosting. This is what [Google recommends](https://firebase.google.com/docs/hosting/functions#direct-requests-to-function) as it requires the least amount of code. All you do is basically configure the `firebase.json` file in your Firebase hosted project to say that for a given url, trigger a cloud function instead of navigating to a new page (like a traditional site url would do). You cloud function url then becomes a "hidden" url in your firebase hosted website.

```json
"hosting": {
  // ...

  // Add the "rewrites" attribute within "hosting"
  "rewrites": [ {
    "source": "/bigben",
    "function": "bigben"
  } ]
}

```
