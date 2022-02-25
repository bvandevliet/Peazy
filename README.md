# Peazy

Peazy is a simple piece of software to read and interpret basic information from an existing project-based ERP database. It is very flexible and customizable using its filter hooks and therefore configurable to be used with various databases. It is not intended as a complete ERP system or replacement thereof, but as a tool for intuitive data retrieval. It's still a work in progress, please be alert and don't expect a flawless product, yet.

This project originated at work where we use an unpleasant ERP system. Many times I had to search for project numbers in order to find the corresponding project folder on the server, all manually and very inconvenient. So I started building an application using programming techniques I know best: web technologies. Which is possible using `Electron.js`. I rewrote Peazy several times and am now developing the final iteration in this open source repository.

# Get started

### Clone this repository
```
git clone https://github.com/bvandevliet/peazy.git
cd ./peazy
```

### Install dependencies
```
npm install
```

### Clone Bulma fork into `assets`
This fork allows for theme support (WIP), see PR: [#3490](https://github.com/jgthms/bulma/pull/3490).
```
cd ./src/renderer/assets
git clone https://github.com/bvandevliet/bulma.git
cd ../../../
```

### Configure to your needs
Rename the `index-example.ts` file in `./src/main/_config` and in `./src/renderer/_config` to `index.ts`.  
In these files you can write code to configure Peazy for your situation.

Further documentation on filter hooks etc. will follow soon ..

### Test
Compile and start Peazy using your configuration files.
```
npm start
```

### Build
Compile and build the Peazy installer.
```
npm run build
```
The idea is to let users make a shortcut to your `Peazy.exe` installer to ensure they always use the latest version.  
But unfortunately `"artifactName": "${productName}.${ext}"` does not work properly, (see issue: [#6661](https://github.com/electron-userland/electron-builder/issues/6661)).  
So you will need to build a launcher that finds and starts the installer named as default: `${productName}-${version}.${ext}`, and let users make a shortcut to the launcher instead.  
I will soon publish another repo containing this launcher.
