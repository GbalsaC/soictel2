angular.module('socially').filter('uninvited', function () {
  return function (users, product) {
    if (!product) {
      return false;
    }

    return _.filter(users, function (user) {
      return !(user._id == product.owner || _.contains(product.invited, user._id));
    });
  }
});