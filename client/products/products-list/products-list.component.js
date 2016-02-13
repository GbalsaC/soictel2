angular.module('socially').directive('productsList', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/products/products-list/products-list.html',
    controllerAs: 'productsList',
    controller: function ($scope, $reactive, $mdDialog, $filter, $state, $location) {
      $reactive(this).attach($scope);

      
      console.log('Location: ',$location.$$path);
      //Use $location.$$path == '/categories' to consolidate a new view
      this.location = $location.$$path;
      this.showAddCategory=false;
      this.tempCategory={};
      this.perPageCat = 3;
      this.perPage = 3;
      this.page = 1;
      this.sort = {
        name: 1
      };
      this.orderProperty = '1';
      this.searchText = '';

      this.helpers({
        products: () => {
          return Products.find({}, { sort : this.getReactively('sort') });
        },
        users: () => {
          return Meteor.users.find({});
        },
        productsCount: () => {
          return Counts.get('numberOfProducts');
        },
        isLoggedIn: () => {
          return Meteor.userId() !== null;
        },
        currentUserId: () => {
          return Meteor.userId();
        },
        images: () => {
          return Images.find({});
        }
      });

      if(this.location == '/categories'){
        //Fix for single route and triple view
        this.orderBy='Categoria';
      }

      this.map = {
        center: {
          latitude: 45,
          longitude: -73
        },
        options: {
          maxZoom: 10,
          styles: [{
            "featureType": "administrative",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#444444"}]
          }, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{"color": "#f2f2f2"}]
          }, {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
          }, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{"saturation": -100}, {"lightness": 45}]
          }, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{"visibility": "simplified"}]
          }, {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
          }, {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{"visibility": "off"}]
          }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
          }]
        },
        zoom: 8
      };
      this.Categories = [{
        name: 'BEBIDAS',
        subcategory: [{name: 'Bebidas Calientes'},
                      {name: 'Bebidas Frias'},
                      {name: 'Bebidas Frappés'},
                      {name: 'NUEVA'}
          ]
        },{name: 'ENTRADAS',
          subcategory: [{name: 'NUEVA'}]
        },{
        name: 'PLATOS FUERTES',
          subcategory: [{name: 'Aves'},
                      {name: 'Cortes'},
                      {name: 'Pizzas'},
                      {name: 'NUEVA'}]
        },
        {name: 'NUEVA',
         subcategory: [{name: 'NUEVA'}]
        }];

      this.subscribe('images');

      this.subscribe('users');

      this.subscribe('products', () => {
        return [
          {
            limit: parseInt(this.perPage),
            skip: parseInt((this.getReactively('page') - 1) * this.perPage),
            sort: this.getReactively('sort')
          },
          this.getReactively('searchText')
        ]
      });

      this.removeProduct = (product) => {
        Products.remove({_id: product._id});
      };

      this.pageChanged = (newPage) => {
        this.page = newPage;
      };
      this.pageChangedCat = (newPage) => {
        this.pageCat = newPage;
      };

      this.updateSort = () => {
        if(this.orderBy=='Nombre'){
          this.sort = {
            name: parseInt(this.orderProperty)
          }

        }else if (this.orderBy=='Precio') {
          this.sort = {
            price: parseInt(this.orderProperty)
          }
          // statement
        }else if(this.orderBy=='Unidad'){
          this.sort = {
            units: parseInt(this.orderProperty)
          }

        }else{
          this.sort = {
            name: parseInt(this.orderProperty)
          }
        }
        
      };
      function subcatHas(wordToCompare) {
        return function(element) {
          if(typeof element.subcategory != 'undefined'){
            return element.subcategory.search(wordToCompare) !== -1;
          }else{
            return false;
          }
        }
    };
    function catHas(wordToCompare) {
        return function(element) {
          if(typeof element.category != 'undefined'){
            return element.category.search(wordToCompare) !== -1;
          }else{
            return false;
          }
        }
    };
      this.getProductFiltered = function (filterArg) {
        return this.products.filter(subcatHas(filterArg));

         /* body... */ 
      }
      this.getProductFiltered2 = function (filterArg) {
        return this.products.filter(catHas(filterArg));

         /* body... */ 
      }
      this.addCategory =function (category) {
         /* body... */ 
         console.log('New addCategory: ', category);
      }

      this.getProductCreator = function (product) {
        if (!product) {
          return '';
        }

        let owner = Meteor.users.findOne(product.owner);

        if (!owner) {
          return 'nobody';
        }

        if (Meteor.userId() !== null && owner._id === Meteor.userId()) {
          return 'me';
        }

        return owner;
      };

      this.rsvp = (productId, rsvp) => {
        Meteor.call('rsvp', productId, rsvp, (error) => {
          if (error) {
            console.log('Oops, unable to rsvp!');
          }
          else {
            console.log('RSVP Done!');
          }
        });
      };

      this.getUserById = (userId) => {
        return Meteor.users.findOne(userId);
      };

      this.outstandingInvitations = (product) => {
        return _.filter(this.users, (user) => {
          return (_.contains(product.invited, user._id) && !_.findWhere(product.rsvps, {user: user._id}));
        });
      };

      this.AddNewProduct = function () {
        $state.go("newProduct");
      };
      this.openAddNewProductModal = function () {
        $mdDialog.show({
          template: '<add-new-product-modal></add-new-product-modal>',
          clickOutsideToClose: true
        });
      };

      this.isRSVP = (rsvp, product) => {
        if (Meteor.userId() == null) {
          return false;
        }

        let rsvpIndex = product.myRsvpIndex;
        rsvpIndex = rsvpIndex || _.indexOf(_.pluck(product.rsvps, 'user'), Meteor.userId());

        if (rsvpIndex !== -1) {
          product.myRsvpIndex = rsvpIndex;
          return product.rsvps[rsvpIndex].rsvp === rsvp;
        }
      };

      this.getMainImage = (images) => {
        if (images && images.length && images[0] && images[0]) {
          var url = $filter('filter')(this.images, {_id: images[0]})[0].url();

          return {
            'background-image': 'url("' + url + '")'
          }
        }
      };
    }
  }
});