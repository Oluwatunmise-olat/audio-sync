<h1 align="center">
  <br>
  <a href="https://github.com/Oluwatunmise-olat"><img width="64" height="64" src="https://img.icons8.com/cotton/64/cloud-refresh.png" alt="audio-sync"/></a>
  <br>
  Audio Sync
  <br>
</h1>

<h4 align="center">Serverless solution that allows you to download audio from a YouTube video, and provides a secure link to download the audio file locally to any device via mail. Leverages AWS Lambda, S3, Dynamo DB and SQS to automate the process.</h4>

## 📇 API Documentation

All API documentation can be found [here](https://documenter.getpostman.com/view/16498899/2s9YypFNsB).

<!-- ## 👷🏽‍♂️ Installation And Usage -->

### 🚧 TODO

- Ses Production Access

### ☢️ Side Notes

- Max video length accepted is 30 minutes
- The public api routes (for media uploads) is hosted on render (free tier) which takes some time to boot back up after moments of inactivity, so you might experience slow api calls if the server has gone into an inactive state
