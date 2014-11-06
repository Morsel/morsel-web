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
| Logged in    | User clicked a button to log in |   | 11/6/2014    |
| Error - API  | An error was received with key="api" | error_message, http_status | 11/6/2014 |
| Error in form | User encountered a form error | message | 11/6/2014 |
| Clicked Share | User clicks to share something | morsel_id, social_type, creator_id, share_type, event_name | 11/6/2014 |
| Clicked iTunes Link | User clicks the link to go to iTunes | | 11/6/2014 |
| Authenticated with Social | User authenticates with social | social_type | 11/6/2014 |
| Signup - Completed Step | User completes a part of the signup flow | signup_step | 11/6/2014 |
| $signup | User completed final part of signup flow, used for retention. Synonymous with Signup - Completed Step:signup_step=final | | 11/6/2014 |
| Clicked Masthead Button | User clicked the big button in the masthead | 11/6/2014 |

### Super Property List
This is a table of all super properties (properties that are sent with every event) names and descriptions that are being tracked. It should be kept up to date whenever super properties are added/altered

| Super Property Name | Description                  | Options      | Date Started |
| ------------------- | ---------------------------- | ------------ | ------------ |
| client_device       | Device user is using | "iphone", "web" | 11/6/2014 |
| client_version      | Version of client's code | "1.0.1" | 11/6/2014 |
| $screen_width       | Width of user's screen   | numeric | 11/6/2014 |
| $screen_height      | Height of user's screen  | numeric | 11/6/2014 |
| morsel_user_id      | User's id (if logged in) | numeric | 4/9/2014 |
| is_staff            | Is user a staff member   | boolean | 11/6/2014 |
| is_pro              | Does user have pro account | boolean | 11/6/2014 |

### Property List
This is a table of all property names and descriptions that are being tracked. It should be kept up to date whenever properties are added/altered

| Property Name      | Description                  | Options      | Date Started |
| ------------------ | ---------------------------- | ------------ | ------------ |
| morsel_id          | The id of a morsel           | numeric      | 11/6/2014    |
| error_message      | The error passed from the API | string       | 11/6/2014    |
| http_status        | The HTTP status passed along with an error | numeric | 11/6/2014 |
| message            | The string message | string       | 11/6/2014    |
| social_type        | Type of social media | "facebook", "twitter", "linkedin", "pinterest", "google_plus" | 11/6/2014 |
| login_type         | How does the user log in? | "facebook", "twitter", "email" | 11/6/2014 |
| signup_step | The step of the signup flow the user completed | "initial", "basic info" | 11/6/2014 |
| share_subject | What type of subject was shared | "event", "morsel-detail" | 11/6/2014 |
| scheduled_event_name | The title of a morsel event | string | 11/6/2014 |
| button_text | The text of a button (that was clicked) | string | 11/6/2014 |
