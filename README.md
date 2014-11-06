# morsel-web

The Website for Morsel!

## Setup

1. Install Node, Bower
2. Clone repo
3. $ npm install
4. $ bower install
5. update server-config/config.js with template
6. See Gruntfile for tasks

## Environment Vars
* APIURL:               https://api-staging.eatmorsel.com
* ERROR_PAGE_URL:       https://morsel-dev.s3.amazonaws.com/error-pages/error.html
* MAINTENANCE_PAGE_URL: https://morsel-dev.s3.amazonaws.com/error-pages/maintenance.html
* MIXPANELTOKEN:        
* NODE_ENV:             local
* PRERENDER_TOKEN:      
* ROLLBAR_ACCOUNT_KEY:
* ROLLBAR_CLIENT_TOKEN:
* SITEURL:              http://dev.eatmorsel.com
* FACEBOOK_APP_ID:      
* TWITTER_CONSUMER_KEY:
* TWITTER_CONSUMER_TOKEN:

## Mixpanel
Mixpanel docs can be found [here](/docs/mixpanel.md)

## When adding new angular app
1. add new folder in src/app/<app_name>
2. add <app_name>_files to build.config.js with template files, vendor files

###### All following in Gruntfile.js

1. add new subtask to html2js grunt task to parse templates from #2
2. add new multitask 'app_<app_name>'
3. add 'app_<app_name>:build' to the array of tasks in delta:html task
4. add 'app_<app_name>:build' to the array of tasks in build-no-style task
5. add file to karmaconfig array for testing
6. add 'app_<app_name>:compile' to the array of tasks in compile task
7. register multitask 'app_<app_name>' with proper view template file
8. add new concat:compile_<app_name>_js subtask pointing to the appropriate files
9. add new concat:compile_<app_name>_css subtask pointing to the appropriate files
10. add js from #10 to array in ngmin:compile task
11. add js from #10 to array in uglify:compile task
12. add 'concat:compile_<app_name>_js' to compile task
13. add 'concat:compile_<app_name>_css' to compile task
14. add 'concat:compile_<app_name>_css' to compass task
15. add 'concat:compile_<app_name>_css' to build-no-style task
16. add <app_name>.css to clean:postCompile array
17. add appropriate line to appserver multitask

###### in server config:
18. /server.tpl.js add an express route for the proper template-<app_name>.js file
19. add <app_name> folder/file to server-config

###### in src/sass
20. add <app_name>.scss

###### in server.tpl.js:
21. add applicable routes
22. add require to <app_name>

