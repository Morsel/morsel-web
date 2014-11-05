- [Overview](#overview)
- [Event List](#event-list)
- [Super Property List](#super-property-list)
- [Property List](#property-list)
- [View List](#view-list)

## Overview
Documentation for web mixpanel events

### Event List
This is a table of all event names, properties and descriptions that are being tracked. It should be kept up to date whenever events are added/altered

| Event Name (case sensitive) | Description                  | Properties      | Date Started |
| ------------------ | ---------------------------- | ------------ | ------------ |
| Clicked Log In      | User clicked a button to log in |   | 11/5/2014    |
| Error - API  | An error was received with key="api" | error_message, http_status | 11/5/2014 |
| Displayed Alert to User | A message was display to a user | message | 11/5/2014 |
| Clicked Share | User clicks to share something | morsel_id, social_type, creator_id, share_type, event_name | 11/5/2014 |
| Clicked iTunes Link | User clicks the link to go to iTunes | | 11/5/2014 |
| Authenticated with Social | User authenticates with social | social_type | 11/5/2014 |
| Signs Up | User completes a part of the signup flow | signup_step | 11/5/2014 |

### Super Property List
This is a table of all super properties (properties that are sent with every event) names and descriptions that are being tracked. It should be kept up to date whenever super properties are added/altered

| Super Property Name | Description                  | Options      | Date Started |
| ------------------- | ---------------------------- | ------------ | ------------ |
| client_device       | Device user is using | "iphone", "web" | 11/5/2014 |
| client_version      | Version of client's code | "1.0.1" | 11/5/2014 |
| $screen_width       | Width of user's screen   | numeric | 11/5/2014 |
| $screen_height      | Height of user's screen  | numeric | 11/5/2014 |
| (mixpanel's user_id)| User's id (if logged in) - should be set with mixpanel.identify | numeric | 11/5/2014 |
| is_staff            | Is user a staff member   | boolean | 11/5/2014 |
| is_pro              | Does user have pro account | boolean | 11/5/2014 |

### Property List
This is a table of all property names and descriptions that are being tracked. It should be kept up to date whenever properties are added/altered

| Property Name      | Description                  | Options      | Date Started |
| ------------------ | ---------------------------- | ------------ | ------------ |
| morsel_id          | The id of a morsel           | numeric      | 11/5/2014    |
| error_message      | The error passed from the API | string       | 11/5/2014    |
| http_status        | The HTTP status passed along with an error | numeric | 11/5/2014 |
| message            | The string message | string       | 11/5/2014    |
| social_type        | Type of social media | "facebook", "twitter", "linkedin", "pinterest", "google_plus" | 11/5/2014 |
| login_type         | How does the user log in? | "facebook", "twitter", "email" | 11/5/2014 |
| signup_step | The step of the signup flow the user completed | "initial", "basic info" | 11/5/2014 |
| share_subject | What type of subject was shared | "event", "morsel-detail" | 11/5/2014 |
| scheduled_event_name | The title of a morsel event | string | 11/5/2014 |

### View List
This is a table of all "views" that appear in both the app and the web version so that we have a consistent way to refer to views across our platforms for reporting. The "property name" column is what will appear in Mixpanel under the "view" property. It should be kept up to date whenever new "views" are added/altered

| Property Name      | Description                  | Date Started |
| ------------------ | ---------------------------- | ------------ |

