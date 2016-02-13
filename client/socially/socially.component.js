angular.module('socially').directive('socially', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/socially/socially.html',
    controllerAs: 'socially',
    controller: function ($scope, $reactive, $mdSidenav, $state) {
      $reactive(this).attach($scope);
      this.openLeftMenu = function(){
        $mdSidenav('left').toggle();
      };
      this.goState = function (State) {
        $state.go(State);
         /* body... */ 
      }
      this.menuOptions = [{
        title: 'Resumen de Categorías',
        state: 'categories',
        icon: 'find_in_page'
      },{
        title: 'Resumen Productos',
        state: 'products',
        icon: 'trending_up'
      },{
        title: 'Nuevo Producto',
        state: 'newProduct',
        icon: 'description'
      }]

      this.helpers({
        isLoggedIn: () => {
          return Meteor.userId() !== null;
        },
        currentUser: () => {
          return Meteor.user();
        }
      });

      this.logout = () => {
        Accounts.logout();
      }
    }
  }
});