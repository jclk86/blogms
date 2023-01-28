const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

// No need for cors, as not connected to cors
// Only needs 1 route handler, as all this service does is watch for events
// looking for commentCreated and then must emit commentModerated event
const app = express();
app.use(bodyParser.json());

// receives event from broker
app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  // no called a ton each time - as it only does this for CommentCreated and then changes to CommentMOderated
  if (type === "CommentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";

    await axios
      .post("http://event-bus-srv:4005/events", {
        type: "CommentModerated",
        data: {
          // id of comment - taking these properties from comment service's post req to event bus -
          // you should create documentation for this on company project - what diff properties exist under every event
          id: data.id,
          postId: data.postId,
          status,
          content: data.content,
        },
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  res.send({});
});

app.listen(4003, () => {
  console.log("listening on 4003");
});
