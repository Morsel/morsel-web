morsel-web
==========

The Website for Morsel!

Setup
==========

1. Install Node, Bower
2. Clone repo
3. $ npm install
4. $ bower install
5. See Gruntfile for tasks

Environment Vars
==========
APIURL:               http://api-staging.eatmorsel.com
ERROR_PAGE_URL:       https://morsel-dev.s3.amazonaws.com/error-pages/error.html
MAINTENANCE_PAGE_URL: https://morsel-dev.s3.amazonaws.com/error-pages/maintenance.html
MIXPANELTOKEN:        
NODE_ENV:             development
PRERENDER_TOKEN:      
SITEURL:              http://dev.eatmorsel.com

When adding new angular app
==========
1. add new folder in src/app/<app_name>
2. add <app_name>_files to build.config.js with template files, vendor files

All following in Gruntfile.js:
3. add new subtask to html2js grunt task to parse templates from #2
4. add new multitask 'app_<app_name>'
5. add 'app_<app_name>:build' to the array of tasks in delta:html task
6. add 'app_<app_name>:build' to the array of tasks in build-no-style task
7. add file to karmaconfig array for testing
8. add 'app_<app_name>:compile' to the array of tasks in compile task
9. register multitask 'app_<app_name>' with proper view template file
10. add new concat:compile_<app_name>_js subtask pointing to the appropriate files
11. add js from #10 to array in ngmin:compile task
12. add js from #11 to array in uglify:compile task
13. add 'concat:compile_<app_name>_js' to compile task
14. add new tasks in concat:build_css and update references to these
15. add <app_name>.css to clean:postCompile array

in server config:
16. /server.tpl.js add an express route for the proper template-<app_name>.js file