angular.module( 'Morsel.add.morsel', [])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'add-morsel', {
    url: '/add/morsel/:morselId',
    views: {
      "main": {
        controller: 'AddMorselCtrl',
        templateUrl: 'app/add/morsel/morsel.tpl.html'
      }
    },
    data:{ pageTitle: 'Morsel Checklist' },
    access: {
      restricted : true
    },
    resolve: {
      currentUser: function(Auth) {
        return Auth.getCurrentUserPromise();
      },
      theMorsel : function(ApiMorsels, $stateParams, $state) {
        return ApiMorsels.getMorsel($stateParams.morselId).then(function(morselData) {
          return morselData;
        }, function() {
          //if there's an error retrieving a morsel, go to drafts
          $state.go('drafts');
        });
      }
    }
  });
})

.controller( 'AddMorselCtrl', function AddMorselCtrl( $scope, currentUser, theMorsel, $stateParams, $state, ApiMorsels, ApiUsers, PhotoHelpers, $q, HandleErrors, $window, $timeout, ApiItems, $sce, $filter, FacebookApi, Mixpanel, $rootScope, $modal ) {
  var morselPromises = [],
      allTemplateData,
      unloadText = 'You will lose unsaved changes if you leave this page.',
      //since we have individual forms submitting within our main form, we don't ever see the big form set back to ng-pristine, even if all the data is saved. so to keep track of "$dirty state" for the big form, we need to do it manually
      morselEditFormDirty = {},
      $body = angular.element(document.getElementsByTagName('body'));

  //make sure this is my morsel to edit
  if(theMorsel.creator_id === currentUser.id) {
    $scope.morsel = theMorsel;

    //store all our social data
    $scope.social = {
      //store our social authentications from the API
      apiAuthentications: {},
      //model for our forms
      model:  {
        facebook : false,
        twitter : false
      },
      //do networks have the ability to publish?
      canPublish: {
        facebook: false,
        twitter: false
      }
    };

    //to store place options and model
    $scope.places = {
      selectedPlace: null,
      placeOptions: null
    };

    $scope.$on('places.add.new', function(e, newPlace) {
      $scope.places.selectedPlace = newPlace;
    });

    //general morsel template data
    morselPromises.push(getMorselTemplates());
    //social authentication data
    morselPromises.push(getAuthentications());
    //places data
    morselPromises.push(getPlaces());
    //once all promises are resolved
    $q.all(morselPromises).then(dataLoaded);

    //request publish_actions
    $scope.addFacebook = function() {
      FacebookApi.init(function(){
        FacebookApi.login(function(response) {
          if (response.status === 'connected') {
            // user is logged into your app and Facebook.
            if(response.authResponse && response.authResponse.userID) {
              //check if we already have authentications for user
              if($scope.social.apiAuthentications.facebook) {
                //user is authenticated with facebook, but we need to check if they can publish
                checkFbPublishStatus($scope.social.apiAuthentications.facebook.uid);
              } else {
                //if not, create new authentication
                createAuthentication(response);
              }
            }
          }
        }, 'publish_actions');
      });
    };

    //handle form errors
    $scope.$on('add.error', function(event, resp){
      handleErrors(resp);
    });

    //form completed. pop overlay for summary
    $scope.popSummaryOverlay = function() {
      var ModalInstanceCtrl = function ($scope, $modalInstance, HandleErrors, ApiMorsels, morsel,Auth) {
        $scope.morsel = morsel;

        //model for our summary
        $scope.morselSummary = {
          text: null
        };

        $scope.cancel = function () {
          $modalInstance.dismiss('cancel');
        };

        $scope.publish = function() {
          var summary = $scope.morselSummary.text ? $scope.morselSummary.text.trim() : null,
              morselParams;

          if(summary) {
            $scope.morselSummaryForm.summary.$setValidity('updatingSummary', false);

            morselParams = {
              morsel: {
                summary: summary
              }
            };

            ApiMorsels.updateMorsel($scope.morsel.id, morselParams).then(function() {
              //summary updated, go ahead and publish
              publish();
              $modalInstance.dismiss('publish');
            }, function(resp) {
              $scope.morselSummaryForm.summary.$setValidity('updatingSummary', true);
              HandleErrors.onError(resp.data, $scope.morselSummaryForm);
            });
          } else {
            //no summary, go ahead and publish
            publish();
            $modalInstance.dismiss('publish');
          }
        };
         $scope.isSubmitMorsel = false;
        $scope.submitMorsel=function(){
          var summary = $scope.morselSummary.text ? $scope.morselSummary.text.trim() : null;
          var hostuser = $scope.morselSummary.host_user ? $scope.morselSummary.host_user : [];
          var morselParams;
          var morselParamsForHost;

          var index = hostuser.indexOf('0');
          if(index!=-1){
             hostuser.splice(index, 1);
          }

          morselParamsForHost = {
            morsel: {
              morsel_host_ids:hostuser
            },
            morsel_id : $scope.morsel.id
          };
          morselParams = {
            morsel: {
              //allow setting location to none/personal
              is_submit: true,
              summary: summary
            }
          };

          ApiMorsels.asscoiateMorselToUser(morselParamsForHost).then(function(morselData){

          }, function(resp) {
            handleErrors(resp);
          });

          ApiMorsels.updateMorsel($scope.morsel.id, morselParams).then(function(morselData) {
            $window.onbeforeunload = undefined;
            $modalInstance.dismiss('publish');
            $window.location.href = 'add/drafts';
          }, function(resp) {
            handleErrors(resp);
          });

        };

        $scope.showButtons = function() {
          var value = $scope.morselSummary.host_user;

          if(value!="0"){
            $scope.isSubmitMorsel = true;
          }else{
            $scope.isSubmitMorsel = false;
          }
        };

        Auth.getCurrentUserPromise().then(function(user){
          ApiMorsels.checkPublish($scope.morsel.id,user.id).then(function(morselData) {
            if(morselData.data=="OK"){
              $scope.canSubmit=true;
            }else{
              $scope.canSubmit=false;
            }

          }, function(resp) {
            handleErrors(resp);
          });

          ApiMorsels.received_association_requests(user.id).then(function(userData) {
            console.log(userData);
            $scope.selectedHosts=[];
            if(userData.data.length){
              $scope.morselSummary={};
              $scope.morselSummary.host_user=userData.data[0].host_user.id;
              angular.forEach(userData.data,function(item,idx){
                if(item.is_approved=="true"){
                  $scope.selectedHosts.push(item);
                }
              });
            }

          }, function(resp) {
            handleErrors(resp);
          });

        },function(resp){

        });
      };

      //track that we've finished the main page of content
      Mixpanel.track('Clicked Next (Add)');
      $timeout(function() {
        $rootScope.modalInstance = $modal.open({
          templateUrl: 'app/add/morsel/morsel-summary-overlay.tpl.html',
          controller: ModalInstanceCtrl,
          resolve: {
            morsel: function () {

              return $scope.morsel;
            }
          }
        });
      },100);
    };

    $scope.$on('add.dirty', function(e, data) {
      morselEditFormDirty[data.key] = data.value;
    });

    $window.onbeforeunload = handleOnbeforeUnload;

    $scope.$on('$destroy', function() {
      $window.onbeforeunload = undefined;
    });

    //need to check for internal routes also
    //why is this firing twice??
    /*
    $scope.$on('$locationChangeStart', function(event, next, current) {
      if ($scope.morselEditForm.$invalid) {
        if(!$window.confirm(unloadText+' Your data will not be saved if you continue.')) {
          event.preventDefault();
        }
      }
    });
    */

    //our custom tooltip messaging
    $scope.customPublishTooltips = [
      {
        'errorName': 'itemPhotoDoneUploading',
        'message': 'Images are still uploading. Please try again shortly'
      },
      {
        'errorName': 'itemDescriptionSaved',
        'message': 'All descriptions must be saved before continuing'
      },
      {
        'errorName': 'morselHasTitle',
        'message': 'Your morsel must have a title'
      },
      {
        'errorName': 'morselTitleSaved',
        'message': 'Your morsel\'s title must be saved before continuing'
      },
      {
        'errorName': 'itemHasPhoto',
        'message': 'All items must have photos to publish. Please add photos or delete unused items'
      }
    ];

    $scope.addItem = function() {
      var itemParams = {
        item: {
          morsel_id: $scope.morsel.id
        }
      };

      $scope.addingItem = true;

      //set "$dirty" for onbeforeunload
      $scope.$emit('add.dirty', {
        key: 'addItem',
        value: true
      });

      ApiItems.createItem(itemParams).then(function(itemResp) {
        if($scope.morsel.items) {
          $scope.morsel.items.push(itemResp.data);
        } else {
          $scope.morsel.items = [itemResp.data];
        }
        $scope.addingItem = false;

        //set "$pristine" for onbeforeunload
        $scope.$emit('add.dirty', {
          key: 'addItem',
          value: false
        });
      }, function(resp) {
        $scope.addingItem = false;
        handleErrors(resp);
      });
    };

    $scope.$on('add.item.delete', function(event, itemId) {
      var confirmed,
          itemToBeDeleted,
          itemIndexToBeDeleted;

      //find which item should be removed
      itemToBeDeleted = _.find($scope.morsel.items, function(el, index) {
        if(el.id === itemId) {
          itemIndexToBeDeleted = index;
          return true;
        }
      });

      if($scope.morsel.items.length === 1) {
        confirmed = confirm('Deleting the last item will delete the entire morsel. Are you sure you want to do this?');

        if(confirmed) {
          deleteMorsel();
        }
      } else {
        confirmed = confirm('Are you sure you want to delete this item?');

        if(confirmed) {
          //show loader
          itemToBeDeleted.deleting = true;

          //set "$dirty" for onbeforeunload
          $scope.$emit('add.dirty', {
            key: 'delete_'+itemId,
            value: true
          });

          ApiItems.deleteItem(itemId).then(function() {
            //remove item from local list
            $scope.morsel.items.splice(itemIndexToBeDeleted, 1);

            //if we just deleted the primary, make sure to update to the last item
            if(itemId === $scope.morsel.primary_item_id) {
              makeCoverPhoto(_.last($scope.morsel.items).id);
            }

            //set "$dirty" for onbeforeunload
            $scope.$emit('add.dirty', {
              key: 'delete_'+itemId,
              value: false
            });
          }, function(resp) {
            //remove loader
            itemToBeDeleted.deleting = false;
            handleErrors(resp);
          });
        }
      }
    });

    $scope.$on('add.item.makeCoverPhoto', function(event, itemId) {
      makeCoverPhoto(itemId);
    });

    $scope.deleteMorsel = function() {
      var confirmed = confirm('This will delete your entire morsel and all photos associated with it. Are you sure you want to do this?');

      if(confirmed) {
        deleteMorsel();
      }
    };

    //config for reordering
    $scope.itemOrderListeners = {
      orderChanged: function(event) {
        //increment one to destination index because API starts at 1 but sortable directive starts at 0
        computeSortOrder(event.source.itemScope.modelValue.id, event.dest.index);
      },
      containment: '#item-reorder'
    };
  } else {
    $state.go('drafts');
  }

  function getMorsel() {
    return ApiMorsels.getMorsel($stateParams.morselId).then(function(morselData) {
      $scope.morsel = morselData;
    }, function() {
      //if there's an error retrieving a morsel, go to drafts
      $state.go('drafts');
    });
  }

  function getMorselTemplates() {
    return ApiMorsels.getTemplates().then(function(templateResp) {
      allTemplateData = templateResp.data;
    }, function() {
      //if there's an error retrieving a morsel, go to drafts
      $state.go('drafts');
    });
  }

  function getPlaces() {
    return ApiUsers.getPlaces(currentUser.id).then(function(placesResp){
      $scope.places.placeOptions = placesResp.data;
    });
  }

  function formatAuthenticationParams(response) {
    return {
      'authentication': {
        'provider': 'facebook',
        'token': response.authResponse.accessToken,
        //tokens coming from the JS SDK are short-lived
        'short_lived': true,
        'uid': response.authResponse.userID
      }
    };
  }

  function createAuthentication(response) {
    var authenticationData = formatAuthenticationParams(response);

    ApiUsers.createAuthentication(authenticationData).then(function(authenticationResp){
      $scope.social.apiAuthentications.facebook = authenticationResp.data;
      //user is authenticated with facebook, but we need to check if they can publish
      checkFbPublishStatus($scope.social.apiAuthentications.facebook.uid);
    }, handleErrors);
  }

  function getAuthentications() {
    return ApiUsers.getAuthentications().then(function(authenticationsResp){
      //go through authentication array and add each as an object with the provider as the key so we know which user has authenticated
      _.each(authenticationsResp.data, function(auth) {
        $scope.social.apiAuthentications[auth.provider] = auth;
      });

      if($scope.social.apiAuthentications.facebook) {
        //user is authenticated with facebook, but we need to check if they can publish
        //checkFbPublishStatus($scope.social.apiAuthentications.facebook.uid);
         $scope.social.canPublish.facebook = true;
      }

      //twitter is much easier (for once). no new permissions needed - if they're authenticated, they can post
      if($scope.social.apiAuthentications.twitter) {
        $scope.social.canPublish.twitter = true;
      }
    }, function() {
      //if there's an error retrieving a morsel, go to drafts
      $state.go('drafts');
    });
  }

  function checkFbPublishStatus(fbUserId) {
    FacebookApi.init(function(){
      FacebookApi.login(function(response) {
        if (response.status === 'connected') {
          FacebookApi.getPermissions(fbUserId, function(userPermissions) {
            var truePublishPermission;

            //get our permissions and see if fb has publish permission
            truePublishPermission = _.find(userPermissions.data, function(p) {
              return p.permission === 'publish_actions' && p.status === 'granted';
            });

            //make sure our API has a current valid token, regardless of whether they allowed publish
            ApiUsers.updateAuthentication($scope.social.apiAuthentications.facebook.id, formatAuthenticationParams(response)).then(function(authenticationResp){
              //reset our local auth
              $scope.social.apiAuthentications.facebook = authenticationResp.data;

              if(truePublishPermission) {
                //allow them to publish
                $scope.social.canPublish.facebook = true;
              }

              //apply our changes that invole the DOM
              //$scope.$apply();
            });
          });
        }
      });
    });
  }

  function dataLoaded() {
    //figure out which template the morsel uses
    $scope.morselTemplate = _.find(allTemplateData, function(t) {
      return t.id === $scope.morsel.template_id;
    });

    //set the place accordingly
    if($scope.morsel.place) {
      //ng-options works by reference, so need to find the proper var
      $scope.places.selectedPlace = _.find($scope.places.placeOptions, function(po){
        return po.id === $scope.morsel.place.id;
      });
    }

    //set up a watch to update place value
    //this has to be after we initially set the place otherwise we'll try to update API with existing value
    $scope.$watch('places.selectedPlace', function(newValue, oldValue) {
      var morselParams;

      //if we have a new selected place, or new value is none but we used to have a selected place
      if((newValue || oldValue) && (newValue != oldValue)) {
        $scope.morselEditForm.morselPlace.$setValidity('updatingPlace', false);

        morselParams = {
          morsel: {
            //allow setting location to none/personal
            place_id: newValue ? newValue.id : null
          }
        };

        ApiMorsels.updateMorsel($scope.morsel.id, morselParams).then(function(morselData) {
          $scope.morsel.place_id = morselData.place_id;
          $scope.morselEditForm.morselPlace.$setValidity('updatingPlace', true);
        }, function(resp) {
          $scope.morselEditForm.morselPlace.$setValidity('updatingPlace', true);
          handleErrors(resp);
        });
      }
    });

    readyMorselForDisplay();
  }

  function readyMorselForDisplay() {
    //figure out which template each item uses and add it to the morsel
    _.each($scope.morsel.items, function(item) {
      if($scope.morselTemplate && $scope.morselTemplate.items) {
        item.displayTemplate = _.find($scope.morselTemplate.items, function(templateItem) {
          return templateItem.template_order === item.template_order;
        });
      } else {
        item.displayTemplate = null;
      }
    });

    //if morsel doesn't have a primary_item_id on load (from older versions of the app), give it one
    if(!$scope.morsel.primary_item_id) {
      makeCoverPhoto(_.last($scope.morsel.items).id).then(function(){
        //finally, show any directives with our data
        $scope.morselDataLoaded = true;
      });
    } else {
      //finally, show any directives with our data
      $scope.morselDataLoaded = true;
    }
  }

  function onPublishSuccess(morselData) {
    //temporary check to determine if a morsel has been published
    if(_.isEmpty(morselData.mrsl) || _.isEmpty(morselData.photos)) {
      $timeout(function() {
        ApiMorsels.getMorsel(morselData.id).then(onPublishSuccess);
      }, 1000); //check every second
    } else {
      //decrease our count to display in the menu
      currentUser.draft_count--;

      //scroll to the top
      $body.scrollTop(0, 0);

      Mixpanel.track('Published Morsel', {
        item_count: morselData.items.length,
        tagged_users_count: morselData.tagged_users_count,
        template_id: morselData.template_id,
        morsel_id: morselData.id,
        place_id : morselData.place_id,
        minutes_to_publish : (new Date(morselData.published_at) - new Date(morselData.created_at))/60000,
        has_summary : morselData.summary ? true : false
      }, function() {
        //bring user to morsel detail
        //remove onbeforeunload so user doesn't get blocked going to morsel detail page
        $window.onbeforeunload = undefined;
        $window.location.href = '/'+morselData.creator.username.toLowerCase()+'/'+morselData.id+'-'+morselData.slug;
      });
    }
  }

  function onPublishError(resp) {
    //make form valid again (until errors show)
    $scope.morselEditForm.$setValidity('loading', true);

    //remove whatever message is there
    $scope.alertMessage = null;

    //scroll to the top
    $body.scrollTop(0, 0);

    handleErrors(resp);
  }

  //stop user if they try to leave the page with an invalid form
  function handleOnbeforeUnload() {
    var formDirty = _.find(morselEditFormDirty, function(dirties){
          return dirties;
        });

    if (formDirty) {
      return unloadText;
    } else {
      return undefined;
    }
  }

  function makeCoverPhoto(itemId) {
    var morselParams = {
      morsel: {
        primary_item_id: itemId
      }
    };

    //set "$dirty" for onbeforeunload
    $scope.$emit('add.dirty', {
      key: 'coverPhoto_'+itemId,
      value: true
    });

    return ApiMorsels.updateMorsel($scope.morsel.id, morselParams).then(function(morselData) {
      //update our model
      $scope.morsel = morselData;
      //need to redo some display stuff
      readyMorselForDisplay();

      //set "$dirty" for onbeforeunload
      $scope.$emit('add.dirty', {
        key: 'coverPhoto_'+itemId,
        value: false
      });
    }, handleErrors);
  }

  function computeSortOrder(itemId, itemIndex) {
    //don't allow another reorder until last one was successful
    $scope.updatingOrder = true;
    //don't let our form submit
    $scope.morselEditForm.itemReorderHidden.$setValidity('reorderingItemsFinished', false);
    //set "$dirty" for onbeforeunload
    $scope.$emit('add.dirty', {
      key: 'sortOrder',
      value: true
    });

    //if it's the first one, send 1
    if(itemIndex === 0) {
      updateSortOrder(itemId, itemIndex, 1);
    } else {
      //find the sort_order of the previous item and pass 1 higher than it
      updateSortOrder(itemId, itemIndex, $scope.morsel.items[itemIndex-1].sort_order + 1);
    }
  }

  function updateSortOrder(itemId, itemIndex, new_sort_order) {
    var itemParams = {
      item: {
        sort_order: new_sort_order,
        morsel_id: $scope.morsel.id
      }
    };

    ApiItems.updateItem(itemId, itemParams).then(function(resp) {
      var i;

      //update sort_order of the item
      $scope.morsel.items[itemIndex].sort_order = new_sort_order;

      //loop through items after the one that moved
      for(i = itemIndex + 1; i < $scope.morsel.items.length; i++) {
        //if their sort_order needs to be incremented, do it
        if($scope.morsel.items[i].sort_order >= new_sort_order) {
          $scope.morsel.items[i].sort_order++;
        }
      }

      //show reorder handles
      $scope.updatingOrder = false;

      //set our form valid
      $scope.morselEditForm.itemReorderHidden.$setValidity('reorderingItemsFinished', true);
      //set "$pristine" for onbeforeunload
      $scope.$emit('add.dirty', {
        key: 'sortOrder',
        value: false
      });
    }, function(resp) {
      //something went wrong, we need to revert the move
      $scope.morsel.items = $filter('orderBy')($scope.morsel.items, 'sort_order');
      $scope.updatingOrder = false;
      //set our form valid, for now
      $scope.morselEditForm.itemReorderHidden.$setValidity('reorderingItemsFinished', true);
      handleErrors(resp);
    });
  }

  function deleteMorsel() {
    $scope.deletingMorsel = true;

    //set "$dirty" for onbeforeunload
    $scope.$emit('add.dirty', {
      key: 'deleteMorsel',
      value: true
    });

    ApiMorsels.deleteMorsel($scope.morsel.id).then(function() {
      $scope.morselDeleted = true;
      $scope.alertMessage = $sce.trustAsHtml('Your morsel has been successfully deleted. Click <a href="/add/drafts">here</a> to return to your drafts.');
      $scope.alertType = 'success';

      //decrease our count to display in the menu
      currentUser.draft_count--;

      //set "$pristine" for onbeforeunload
      $scope.$emit('add.dirty', {
        key: 'deleteMorsel',
        value: false
      });

      //scroll to the top
      $body.scrollTop(0, 0);
    }, function(resp) {
      $scope.deletingMorsel = false;
      handleErrors(resp);
    });
  }

  function handleErrors(resp) {
    HandleErrors.onError(resp.data, $scope.morselEditForm);
  }

  function publish() {
    var morselParams = {};

    //check if everything is valid
    if($scope.morselDataLoaded && $scope.morselEditForm.$valid) {
      //disable form while request fires
      $scope.morselEditForm.$setValidity('loading', false);

      if($scope.social.model.facebook) {
        morselParams.post_to_facebook = true;
      }

      if($scope.social.model.twitter) {
        morselParams.post_to_twitter = true;
      }

      //set "$dirty" for onbeforeunload
      $scope.$emit('add.dirty', {
        key: 'publish',
        value: true
      });

      //scroll to the top
      $body.scrollTop(0, 0);

      //call our publishMorsel method to take care of the heavy lifting
      ApiMorsels.publishMorsel($scope.morsel.id, morselParams).then(onPublishSuccess, onPublishError);
    }
  }
});
