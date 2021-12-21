# 👋 Hey there! Welcome to my official Github Repository.

### Greetings! I'm Lunary, just another simple Moderation Discord bot. [Customize your server management with me.](https://dsc.gg/lunarybot)

#### 🧐 You can find out my commands using _`/help`_(Slash Command), and if you get any issue, please join my [support server](https://discord.gg/8K6Zry9Crx), or [open an issue](https://github.com/LunaryBot/LunaryBot/issues/new) here!

## 💻 Self-hosting instances.

#### As Lunary has grown, the repository has become open, and this means that everyone can see the source code, and copies are being allowed as stated in the license, but the development team has no duty to support these copies.

#### But before creating a copy, keep in mind that everyone must respect the license for use.

### How to self hosting

> Install nodejs 16.6 or higher. You can download and install here https://nodejs.org.

> Create a file named _`.env`_ and input this informations

```
DISCORD_TOKEN=Discord Bot Token
```

> Create a file named _`config.yml`_ and input this informations

```yml
# Bot Prefix
prefix: ""

# Default Locale
defaultLocale: "pt-BR"

# Developers id list
devs:
    - "id"
    - "id"

# Clusters Name
clustersName:
    0: "Cluster 1"
    1: "Cluster 2"

# Database Config
firebaseConfigGuilds:
    apiKey:
    authDomain:
    databaseURL:
    projectId:
    storageBucket:
    messagingSenderId:
    appId:
    measurementId:
firebaseConfigUsers:
    apiKey:
    authDomain:
    databaseURL:
    projectId:
    storageBucket:
    messagingSenderId:
    appId:
    measurementId:
firebaseConfigLogs:
    apiKey:
    authDomain:
    databaseURL:
    projectId:
    storageBucket:
    messagingSenderId:
    appId:
    measurementId:

# URL's
links:
    baseOauth2Discord: https://discord.com/oauth2/authorize
    website:
        baseURL:
        home:
        invite:
        support:
        commands:
        vote:
        dashboard:
            me:
            guild:
        callback:
    support: https://discord.gg/8K6Zry9Crx
    vote: https://top.gg/bot/777654875441463296/vote
```

> In your terminal, use

```
npm install
```

```
node .
```

> More locales in https://github.com/LunaryBot/LunaryLocales

## 🚀 Contributing

### Source Code

#### If you want to contribute to my repository, make code improvements.

-   Fork this repository for your profile and make the desired changes.
-   If you need slash commands, just ask some developer on the [support server](https://discord.gg/8K6Zry9Crx).
-   Once they're done, make a pull request to the `canary` branch if you are contributing to the new version, or the `master` branch if you are contributing to the stable and running version.

![Lunary Bot](https://media.discordapp.net/attachments/826844594464489494/902217896858619944/hi_hi_DgQwYJL.png)
