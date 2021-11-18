# Dynamic Template CLI

CLI used for building, serving and creating DT's ad units.

## Requirements
- Node v10

### Install
```bash
npm install -g git+ssh://git@bitbucket.org:vungle_creative_labs/vungle-dynamo-cli.git#vX.X.X
```

### CLI
```bash
$ vungle-dynamo-cli --help
vungle-dynamo-cli <command>

Commands:
  vungle-dynamo-cli build          Build ad unit for production
  vungle-dynamo-cli clean          Clean dist or/and release
  vungle-dynamo-cli create <name>  Create a new ad unit
  vungle-dynamo-cli docs           Generate JSDocs
  vungle-dynamo-cli fly <action>   Git flow fly operation on develop, release/*
                                   and master branches.
  vungle-dynamo-cli push           Create new version of bundle and push to
                                   dashboard and||or slack.
  vungle-dynamo-cli serve          Serve ad unit in development mode
  vungle-dynamo-cli upload         Upload bundle to AWS S3
  vungle-dynamo-cli validate       Validate ad unit config

Options:
  --version  Show version number                                       [boolean]
  --help     Show help                                                 [boolean]
```

## Development setup

  * Install [nodejs](http://nodejs.org) - Chrome's JavaScript runtime

### Install

```bash
npm install
```

## Using CLI with template
```bash
$ vungle-dynamo-cli serve
[SERVE]: ...
[BUILD:BUNDLE]: ...
(node:17297) DeprecationWarning: Tapable.plugin is deprecated. Use new API on `.hooks` instead
Hash: 8737da6025cee9cdb742
Version: webpack 4.41.5
Time: 4551ms
Built at: 01/27/2020 1:36:00 PM
                    Asset       Size       Chunks             Chunk Names
        adUnitConfig.json   17.2 KiB               [emitted]
        baseTokens.dev.js   4.71 KiB               [emitted]
             data/i18n.js   8.26 KiB               [emitted]
                 eruda.js    472 KiB               [emitted]
               index.html    581 KiB               [emitted]
                 mraid.js     22 KiB               [emitted]
             tokensDev.js  127 bytes               [emitted]
       vungle.main.min.js    509 KiB  vungle-main  [emitted]  vungle-main
vungle.third-party.min.js   19.7 KiB               [emitted]
Entrypoint vungle-main = vungle-main.css vungle.main.min.js

[BUILD:BUNDLE:SUCCESS]
[Browsersync] Access URLs:
 -------------------------------------
       Local: http://localhost:9090
    External: http://{IP}:9090
 -------------------------------------
          UI: http://localhost:9091
 UI External: http://localhost:9091
 -------------------------------------
[Browsersync] Serving files from: /Users/vungle/Documents/vungle-git/dtTest/dist

$ vungle-dynamo-cli build
[BUILD]: ...
[BUILD:BUNDLE]: ...
(node:17733) DeprecationWarning: Tapable.plugin is deprecated. Use new API on `.hooks` instead
Hash: 52a78bf0aac6a362d2e5
Version: webpack 4.41.5
Time: 5813ms
Built at: 01/27/2020 1:36:35 PM
                    Asset       Size  Chunks                    Chunk Names
        adUnitConfig.json   17.2 KiB          [emitted]
        baseTokens.dev.js   4.71 KiB          [emitted]
             data/i18n.js   8.26 KiB          [emitted]
                 eruda.js    472 KiB          [emitted]  [big]
               index.html    248 KiB          [emitted]  [big]
                 mraid.js   57 bytes          [emitted]
             tokensDev.js  127 bytes          [emitted]
       vungle.main.min.js    181 KiB       0  [emitted]         vungle-main
vungle.third-party.min.js   19.7 KiB          [emitted]
Entrypoint vungle-main = vungle-main.css vungle.main.min.js

WARNING in asset size limit: The following asset(s) exceed the recommended size limit (244 KiB).
This can impact web performance.
Assets:
  eruda.js (472 KiB)
  index.html (248 KiB)

WARNING in webpack performance recommendations:
You can limit the size of your bundles by using import() or require.ensure to lazy load some parts of your application.
For more info visit https://webpack.js.org/guides/code-splitting/

[BUILD:BUNDLE:SUCCESS]
[BUILD:ZIP]: testTpl
[BUILD:ZIP:SUCCESS]: testTpl
[BUILD:SUCCESS]
```

### Create new template

```bash
$ vungle-dynamo-cli create dtTest
[CREATE]: ...
Dynamo CLI
? Please pick a preset single-view
? Templates name (Test Template) DT Test
? Bundle name (testTemplate) testTpl
? Page name (TestPage) TestTplPage
? Version number (develop, master, specific version e.q. v1.0.0) develop
[CREATE]: dtTest
[CREATE:SUCCESS]: Building Finished.
[RUN]
cd dtTest
npm install && npm install
```

**IMPORTANT!!!**
Because we are installing packages with dependencies to git repositories, it could happen that certain packages are not installed with the first npm install, so just in case run npm install twice.

### Explanation of `vungle.config.js`
```
name: "singleView",
// Configuration used when deploying templates through dashboard API
dashboard: [
    {
        upload: ["development", "testing", "production"],
        slack: ["development", "testing", "production"],
        zip: "singleView.zip",
        template: {
            format: "single_page_fullscreen",
            is_custom_creative: false,
            is_global: true,
            name: "Single View",
            publisherWhitelist: [],
            status: "active"
        }
    }
]
// Used with upload command, which directly deploys to S3. Normally not defined, as most of our templates deployment goes through Dashboard
upload: [
    { zip: "singleView.zip" }
]
```

## ENV
* Set up a folder in S3, in the the 'vvv-qa' bucket. You will use this to test ad units later on.
* Export environment variables:
Copy the following to your `.bashrc`, `.bash_profile`, `.zshrc`, or other.

```bash
# DEV AWS
DEV_AWS_KEY=AKIAIOSFODNN7EXAMPLE
DEV_AWS_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DEV_AWS_REGION=us-west-2

DEV_AWS_ENDPOINT=http://minio-champa:9000

DEV_AWS_BUCKET=vvv-vungle
DEV_AWS_FOLDER="template-rtb/"

# QA AWS
QA_AWS_KEY=AKIAIOSFODNN7EXAMPLE
QA_AWS_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
QA_AWS_REGION=us-west-2

QA_AWS_BUCKET=vvv-vungle
QA_AWS_FOLDER="template-rtb/"

# PROD AWS
PROD_AWS_KEY=AKIAIOSFODNN7EXAMPLE
PROD_AWS_SECRET=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
PROD_AWS_REGION=us-west-2

PROD_AWS_BUCKET=vvv-vungle
PROD_AWS_FOLDER="template-rtb/"
```
  *Hint: Remember to add the trailing / when adding the AWS_FOLDER*

**Deployment ENV Variables**

**Important**

When setting up URL's make sure you do not end the ENV variable with `/`.
```
# Legacy Dashboard
DASHBOARD_DEV_URL="http://127.0.0.1:3000"
DASHBOARD_QA_URL="http://dashboard.qa.vungle.com"
DASHBOARD_PROD_URL="https://dashboard.vungle.com"
DASHBOARD_DEV_USERNAME="*******"
DASHBOARD_DEV_PASSWORD="*******"
DASHBOARD_QA_USERNAME="*******"
DASHBOARD_QA_PASSWORD="*******"
DASHBOARD_PROD_USERNAME="*******"
DASHBOARD_PROD_PASSWORD="*******"

# Mission Control Dashboard
DASHBOARD_DEV_URL_MC_AUTH="http://127.0.0.1:4002"
DASHBOARD_DEV_URL_MC_UPLOAD="http://127.0.0.1:4001"
DASHBOARD_DEV_URL_MC_MANAGE="http://127.0.0.1:4000"

DASHBOARD_QA_URL_MC_AUTH="https://auth-qa.api.vungle.com"
DASHBOARD_QA_URL_MC_UPLOAD="https://upload-qa.api.vungle.com"
DASHBOARD_QA_URL_MC_MANAGE="https://manage-qa.api.vungle.com"

DASHBOARD_PROD_URL_MC_AUTH="https://auth.api.vungle.com"
DASHBOARD_PROD_URL_MC_UPLOAD="https://upload.api.vungle.com"
DASHBOARD_PROD_URL_MC_MANAGE="https://manage.api.vungle.com"

# Slack
SLACK_CONVERSATION_IDS="CGG4WMV8U"
```

**Development ENV Variables**

When in developing ad unit create a `.env` file and populate it with appropriate data.
```
# PORTS
DEV_PORT=9090
DEV_PORT_UI=9091

# Automatically open browser
DEV_OPEN=true
```