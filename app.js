import { WebClient } from '@slack/client';
import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';

dotenv.config();

const router = express.Router();

const web = new WebClient(process.env.SLACK_TOKEN);

const initial_response = {
  "text": "What would you like to do?",
  "attachments": [
    {
      "text": "Add Users to:",
      "fallback": "Slack adding automation",
      "callback_id": "adding_automation",
      "color": "good",
      "attachment_type": "default",
      "actions": [
        {
          "name": "add_to_channel_button",
          "text": "Existing channel with emails",
          "type": "button",
          "value": "add_to_existing_channel"
        }
      ]
    },
    {
      "text": 'Remove users from:',
      "fallback": "Slack removing automation",
      "callback_id": "removing_automation",
      "color": "danger",
      "attachment_type": 'default',
      "actions": [
        {
          "name": 'remove_from_channel_button',
          "text": 'Existing channel with emails',
          "type": 'button',
          "value": 'remove_from_channel',
        }
      ]
    }
  ]
}

const add_users_dialog = {
  "callback_id": "add_users_dialog",
  "title": "Add users to a channel",
  "submit_label": "Add",
  "notify_on_cancel": true,
  "elements": [
    {
      "label": "Select channel",
      "name": "channel_selection",
      "type": "select",
      "optional": false,
      "data_source": "channels"
    },
    {
      "label": "User emails",
      "name": "email_inputs",      
      "type": "textarea",
      "optional": false,
      "hint": "One email per line",
      "value": "email1\nemail2\nemail3\n..."
    },
  ]
};

const identify_action = (req, res, next) => {
  const { type, callback_id, actions } = JSON.parse(req.body.payload);
  let current_action;
  if (type === "interactive_message") {
    current_action = `${actions[0].name}`;
  } else if (type === "dialog_submission") {
    current_action = `${callback_id}`
  } else {
    current_action = null;
  }
  res.locals.current_action = current_action;
  console.log('==>Current Action: ', current_action)
  next();
};

const send_message = (message, response_url) => {
  return axios.post(response_url, message, {
    headers: {
      "Content-type": "application/json"
    }
  });
};

const open_dialog = (trigger_id, dialog) => {
  // Required scope: dialog.open
  web.dialog.open({ trigger_id, dialog })
    .then((res) => {
      console.log('Opening dialog successful');
    })
    .catch((err) => {
      console.log('Error while opening dialog');
    });
};

const get_user_id = async (user_email) => {
  // Required scope: users:read, users:read.email
  let user_id;
  await web.users.lookupByEmail({email: user_email})
    .then((res) => { 
      user_id = res.user.id;
    })
    .catch((err) => {
      console.log('There was an error lokking up the user')
    })
  return user_id;
};

const add_user_to_channel = async (user_email, channel_id) => {
  // Required scope: channels:write
  const user_id = await get_user_id(user_email);
  web.channels.invite({channel: channel_id, user: user_id})
    .then((res) => {
      console.log('I just added a user to a channel');
    })
    .catch((err) => {
      console.log('There was an error adding user to channel', err)
    })
};

const add_multiple_users_to_channel = async (user_emails, channel_id) => {
  user_emails.forEach(async (current_user_email) => {
    await add_user_to_channel(current_user_email, channel_id);
  });
};

const actionHandlers = {
  "add_to_channel_button": (req, res) => {
    res.status(200)
      .json({ "text": "Opening dialog to provide user emails :email:..." });
    const { trigger_id } = JSON.parse(req.body.payload);    
    open_dialog(trigger_id, add_users_dialog);
  },

  "add_users_dialog": async (req, res) => {
    res.status(200).json({});
    const { response_url, submission } = JSON.parse(req.body.payload);
    const { channel_selection, email_inputs } = submission;
    //ISSUE: I need to do some validateion here for both the email submitted and the channel choosen.
    const formatted_email_inputs = email_inputs.split('\n');
    await send_message(
      {"text": '*Users* are currently being added :smile: _util_ does it.'},
      response_url,
    );
    await add_multiple_users_to_channel(formatted_email_inputs, channel_selection);
    // ISSUE: The response below is sent before task finishes adn this is because I am unable to await adding multiple user
    await send_message(
      // IMPROVEMENT: This message should display the users that were added an the channel they were added to.
      {"text": 'Hey yo! I have finished adding the users :white_check_mark:.'},
      response_url
    )
  }
};

router.post('/', (req, res) => {
  res.status(200).json(initial_response)
});

router.post('/interactive', 
  identify_action, 
  (req, res) => {
    if (res.locals.current_action) {
      actionHandlers[res.locals.current_action](req, res);
    } else {
      res.status(200)
        .json({ "text": "I am sorry, I am unable to interprete your latest action :question:." });
    }
  }
);

export default router;
