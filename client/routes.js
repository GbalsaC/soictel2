angular.module('socially')
  .config(function ($urlRouterProvider, $stateProvider, $locationProvider) {
    $locationProvider.html5Mode(true);

    $stateProvider
      .state('products', {
        url: '/products',
        template: '<products-list></products-list>'
      })
      .state('categories', {
        url: '/categories',
        template: '<products-list></products-list>'
      })
      .state('newProduct', {
        url: '/admin/products/nuevo',
        template: '<add-new-product></add-new-product>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('productDetails', {
        url: '/products/:productId',
        template: '<product-details></product-details>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('login', {
        url: '/login',
        template: '<login></login>'
      })
      .state('register', {
        url: '/register',
        template: '<register></register>'
      })
      .state('resetpw', {
        url: '/resetpw',
        template: '<resetpw></resetpw>'
      });

    $urlRouterProvider.otherwise("/products");
  })
  .run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
      if (error === 'AUTH_REQUIRED') {
        $state.go('products');
      }
    });
  });