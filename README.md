# Livid

a simple bot for [Livid](discord.gg/livid)

## Features

| Implemented |                    Feature name                     |
| ----------- | :-------------------------------------------------: |
| ✔           | [Vanity Presence Repping](#vanity-presecne-repping) |
| ✔           |        [Vanity Join Kick](#vanity-join-kick)        |
| ✔           |          [Voice Chat Text-To-Speech](#tts)          |

<details>
  <summary><i>Feature Explanation</i></summary>

  <details id="vanity-presecne-repping">
    <summary>Vanity Presence Repping</summary>

    <p>Gives a role if someone includes the vanity link within their custom status.</p>

  </details>

  <details id="vanity-join-kick">
    <summary>Vanity Join Kick</summary>

    <p>Detects if someone joins through a vanity link, and kicks them.</<p>>
    <p>Has an option for a log channel.</p>

  </details>

  <details id="tts">
    <summary>Voice Chat Text-To-Speech</summary>

    <p>Takes incoming messages within a voice channel's text area, and reads them out using Google's text to speech API.</p>

  </details>
</details>

## Configuration

A generic configuration option will look around the following:

```jsonc
{
  "featureName": {
    "enabled": true, // if the feature is enabled/if we should register it
    "optionOrThing": "whatever",
    "subfeature": {
      "enabled": false // if the sub feature is enabled
    }
  }
}
```

Each option within a feature should have a self explanatory name.

## Prerequisites

- Node.js (v18.15.0) alongside npm
- The Typescript Compiler

```sh
# After installing Node.js
npm install typescript -g
```

- Git

## Installation

1. Clone the repo

```sh
git clone https://github.com/acelikesghosts/livid-bot
```

2. [Create a Discord bot application](#how-to-make-a-discord-bot)
3. Rename the `config.example.json` file to `config.json` and fill in the respective details.
4. Install the npm dependencies

```sh
npm ci
```

5. Compile the source code

```sh
tsc
```

6. Deploy the slash commands

```sh
node scripts/deployCommands.js
```

7. Start the bot

```sh
npm run start
```

### How to make a Discord bot

#### Create a Discord Application:

- Go to the Discord Developer Portal.
- Click on the "New Application" button in the top right corner.
- Give your application a name.

#### Create a Bot User:

- Once your application is created, navigate to the "Bot" tab on the left sidebar.
- Click on "Add Bot" to turn your application into a bot user.
- Customize the bot's username, avatar, and other settings as desired.

#### Get Bot Token:

- After creating the bot user, you'll see a section with the bot's token.
- This token is essentially the bot's password and should be kept confidential. Never share it publicly or commit it to public repositories.

#### Add Bot to a Server:

- Still in the Developer Portal, navigate to the "OAuth2" tab on the left sidebar.
- In the "Scopes" section, select "bot."
- Scroll down to the "Bot Permissions" section and choose the permissions your bot will require.
- Copy the generated OAuth2 URL.
- Open a new browser tab and paste the URL. From there, select a server where you have the necessary permissions and click "Authorize."
