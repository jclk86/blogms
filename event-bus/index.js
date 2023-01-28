const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

// This data structure mimics a db that holds all events that ever occurred up to the present
const events = [];

app.post("/events", (req, res) => {
  const event = req.body;
  // lets all the other services below know about which event has just occurred from which microservice request was made to - it even lets the microservice(ms) request made to know about it as well.
  // Each ms sits at a specific port and event bus makes requests to each of them at their own /events endpoint.
  // Each ms responds to that request with its own behavior -- ex: if a post request, the event bus recieves event and then emits it to all the ms below and each ms does something with data from event, like create its own entry for post into its own db.
  // These are the services that you have decided needed to know about the events

  events.push(event);
  // NOTICE THE PORT
  axios
    .post("http://posts-clusterip-srv:4000/events", event)
    .catch((err) => console.log(err.message));
  axios
    .post("http://comments-srv:4001/events", event)
    .catch((err) => console.log(err.message));
  axios
    .post("http://query-srv:4002/events", event)
    .catch((err) => console.log(err.message));
  axios
    .post("http://moderation-srv:4003/events", event)
    .catch((err) => console.log(err.message));

  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("Listening on 4005");
});
