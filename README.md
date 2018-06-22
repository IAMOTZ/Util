# Util
This is a prototype for a slack app that automates the very repetitive process that is done manually on slack such as:  
  
- Adding multiple users to a new channel
- Adding multiple users to an existing channel
- Removing multiple users from a channel

## How to use this project:
These instructions would get you a copy of this project up and running on your local machine for development and testing purposes.

### Prerequisites
- Git
- Node
- A slack workspace
- A way of serving the app through HTTP(I recommend [ngrok](https://ngrok.com/) for dev purpose).

### Installation

#### Creating/Installing the slack app
- The slack app needs to be installed in a slack workspace, so make sure you create one.
- The next thing is to create the slack app, click [here](https://api.slack.com/apps/new) to do that.
- After creating the app, you need to enable these features that the app would be using:
- - `Slach Command`
- - `Interactive Component`
- You can install the app afterward

#### Setting up the server
- Clone the repository
- Change into the directory of the project
- Use `$ npm install` to install all the dependency packages.
- Create a `.env` file in the root folder to provide all the needed environment variables as specified in `.env.example`
- Use `$ npm start` to start the server

## Current Features 
These are the features that are currently working in this slack app: 

- You can add users in bulk to an existing channel with their emails

## What the workflow looks like

### Adding Users in bulk to a channel
- You trigger the whole process with a slash command `/<the name of the slash command you created>`
- The slack app displays a list of options as buttons
- Click the option for `Adding users to existing channel with email`
- This should open up a dialog
- Select the channel to add the users to from a channels-drop-down 
- Type the emails of the users in the text-area for accepting emails(one email per line)
- Click on the Add button
- If everything goes well, you would receive a message from the app that the users are already added to the channel.
- If there is an error, you would also receive a message from the app describing the error

## Author
This project is originally a hackathon project which I was a part of. 
The original codebase is written in python and it can be found [here](https://github.com/jubrilissa/smart_add/tree/hackathon). It is kind of messy and spaghetti modeled (hackathon-tinz :simle:) so I decided to port some of the functionalities to `NodeJS` adding some sanity to the codebase.
