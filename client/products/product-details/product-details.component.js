angular.module('socially').directive('productDetails', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/products/product-details/product-details.html',
    controllerAs: 'productDetails',
    controller: function ($scope, $stateParams, $reactive) {
      $reactive(this).attach($scope);

      this.subscribe('products');
      this.subscribe('users');

      this.helpers({
        product: () => {
          return Products.findOne({_id: $stateParams.productId});
        },
        users: () => {
          return Meteor.users.find({});
        },
        isLoggedIn: () => {
          return Meteor.userId() !== null;
        },
        currentUserId: () => {
          return Meteor.userId();
        }
      });

      this.map = {
        center: {
          latitude: 45,
          longitude: -73
        },
        zoom: 8,
        events: {
          click: (mapModel, eventName, originalEventArgs) => {
            if (!this.product)
              return;

            if (!this.product.location)
              this.product.location = {};

            this.product.location.latitude = originalEventArgs[0].latLng.lat();
            this.product.location.longitude = originalEventArgs[0].latLng.lng();

            //scope apply required because this event handler is outside of the angular domain
            $scope.$apply();
          }
        },
        marker: {
          options: { draggable: true },
          events: {
            dragend: (marker, eventName, args) => {
              if (!this.product.location)
                this.product.location = {};

              this.product.location.latitude = marker.getPosition().lat();
              this.product.location.longitude = marker.getPosition().lng();
            }
          }
        }
      };

      this.save = () => {
        Products.update({_id: $stateParams.productId}, {
          $set: {
            name: this.product.name,
            description: this.product.description,
            'public': this.product.public,
            location: this.product.location
          }
        }, (error) => {
          if (error) {
            console.log('Oops, unable to update the product...');
          }
          else {
            console.log('Done!');
          }
        });
      };

      this.invite = (user) => {
        Meteor.call('invite', this.product._id, user._id, (error) => {
          if (error) {
            console.log('Oops, unable to invite!');
          }
          else {
            console.log('Invited!');
          }
        });
      };

      this.canInvite = () => {
        if (!this.product)
          return false;

        return !this.product.public && this.product.owner === Meteor.userId();
      };
    }
  }
});