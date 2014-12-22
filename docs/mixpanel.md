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
| Logged in    | User completed log in | login_type | 11/6/2014 |
| Error - API  | An error was received with key="api" | error_message, http_status | 11/6/2014 |
| Error in form | User encountered a form error | message | 11/6/2014 |
| Clicked Share | User clicks to share something | morsel_id, social_type, creator_id, share_type, event_name | 11/6/2014 |
| Clicked iTunes Link | User clicks the link to go to iTunes | | 11/6/2014 |
| Authenticated with Social | User authenticates with social | social_type | 11/6/2014 |
| Signup - Completed Step | User completes a part of the signup flow | signup_step | 11/6/2014 |
| $signup | User completed final part of signup flow, used for retention. Synonymous with Signup - Completed Step:signup_step=final | | 11/6/2014 |
| Clicked Masthead Button | User clicked the big button in the masthead | | 11/6/2014 |
| Published Morsel | User successfully published a morsel |item_count, tagged_users_count, template_id, morsel_id, place_id, minutes_to_publish, has_summary | 11/14/2014 |
| Clicked hashtag | User clicked a hashtag | view, hashtag | 12/12/2014 |
| Focused on Explore Search | A user puts cursor into search input on Explore page | view | 12/12/2014 |
| Explore searched | User performed a search in Explore | view, explore_search_trigger | 12/12/2014 |
| Followed User | User follows another user | view | 12/12/2014 |
| Clicked User Profile | User clicks another user's avatar/name | view | 12/12/2014 |
| Clicked Add to Collection | Users clicks add to collection icon | morsel_id | 12/19/2014 |
| Added morsel to collection | User added a morsel to a collection | morsel_id, collection_id, made_new_collection | 12/19/2014 |
| Created new Collection | User made a collection | has_description, view, collection_id | 12/19/2014 |

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
| is_shadow_user      | User logged in as someone else | boolean | 11/6/2014 |

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
| item_count | Number of items in a morsel | numeric | 11/14/2014 |
| tagged_users_count | Number of users tagged on a morsel | numeric | 11/14/2014 |
| template_id | Which template was used to make a morsel | numeric | 11/14/2014 |
| place_id | The ID of a Morsel Place | numeric | 11/14/2014 |
| minutes_to_publish | The time (in minutes) it took a morsel between creation and publish | numeric | 11/14/2014 |
| has_summary | Whether a morsel has a summary | boolean | 12/12/2014 |
| hashtag | A #hashtag | string | 12/12/2014 |
| promoted | Whether something is promoted by API | boolean | 12/12/2014 |
| explore_search_trigger | How the user performed Explore search | "Click result","Form submit" | 12/12/2014 |
| made_new_collection | Whether a new collection was made | boolean | 12/19/2014 |
| collection_id | The id of a Collection | numeric | 12/19/2014 |
| has_description | Whether something has a description | boolean | 12/19/2014 |


### View List
This is a table of all "views" that appear on the website. The "property name" column is what will appear in Mixpanel under the "view" property, on events that it is worthwhile to measure the view in which they occurred. Note that these are abstract "views" and don't necessarily correspond to states or URLs. It should be kept up to date whenever new "views" are added/altered

| Property Name      | Description                  | Date Started |
| ------------------ | ---------------------------- | ------------ |
| morsel_details | The details page of a single morsel | 12/12/2014 |
| explore_morsels | The Explore morsels page | 12/12/2014 |
| explore_users | The Explore users page | 12/12/2014 |
| user_profile_collections | Collections tab of user's profile page | 12/19/2014 |

