const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};

// Get - Gets all posts and associated comments <-- the fetechposts in Client makes request to this end point.
app.get("/posts", (req, res) => {
  // returns the posts from its own db.
  res.send(posts);
});

// Post - recieves the post created event and adds it to its own data structure/db
app.post("/events", (req, res) => {
  const { type, data } = req.body;

  // checks type of event and saves the data from the event received into its database
  handleEvent(type, data);

  res.send({});
});

app.listen(4002, async () => {
  console.log("Listening on 4002");
  // whenever query services comes online -- so if it goes down --
  // this is a good time to get a listing of all events that have been emitted up to this point in time
  try {
    const res = await axios.get("http://event-bus-srv:4005/events");
    // remember, axios always returns a data property on response
    for (let event of res.data) {
      console.log("Processing event ", event.type);

      handleEvent(event.type, event.data);
    }
  } catch (error) {
    console.log(error.message);
  }
});

function handleEvent(type, data) {
  if (type === "PostCreated") {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
  }

  if (type === "CommentCreated") {
    // taken for commentsService post request
    const { id, content, postId, status } = data;

    const post = posts[postId];
    // added to array of comments in post in its own db
    post.comments.push({ id, content, status });
  }

  if (type === "CommentUpdated") {
    //remember, this is a generic event its recieving. It could be updating anything
    const { id, content, postId, status } = data;

    const post = posts[postId];
    const comment = post.comments.find((comment) => {
      return comment.id === id;
    });
    // we don't know what was updated, so this makes sure everything updates
    comment.status = status;
    comment.content = content;
  }
}
