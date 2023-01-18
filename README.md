# acsn

acsn is an acronym for Asana Comment Slack Notification.  
acsn sends notifications to your Slack channel when Asana tasks are commented on.

## Usage

1. Install deps

```
$ yarn 
```

2. Create `.env` file

```
$ cp .env.sample .env
```

|Key|Value|
|-|-|
|ASANA_PAT|[Asana personal access token](https://developers.asana.com/docs/personal-access-token)|
|BASE_URL|Your server base url|
|PROJECT_ID|Your Asana project ID|
|WEBHOOK_URL|Webhook URL for your Slack|

**`BASE_URL` format**

- Must start with `https://`
- Must not end with `/`


OK: https://foo.bar   
NG: https://foo.bar/ http://foo.bar

3. Run

```
$ yarn run start
```
