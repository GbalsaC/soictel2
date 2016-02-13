angular.module('socially').directive('addNewProductModal', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/products/add-new-product-modal/add-new-product-modal.html',
    controllerAs: 'addNewProductModal',
    controller: function ($scope, $stateParams, $reactive, $mdDialog) {
      $reactive(this).attach($scope);

      this.helpers({
        isLoggedIn: () => {
          return Meteor.userId() !== null;
        }
      });

      this.newProduct = {};

      this.addNewProduct = () => {
        this.newProduct.owner = Meteor.userId();
        this.newProduct.images = (this.newProduct.images || {}).map((image) => {
          return image._id;
        });

        Products.insert(this.newProduct);
        this.newProduct = {};
        $mdDialog.hide();
      };

      this.close = () => {
        $mdDialog.hide();
      };

      this.addImages = (files) => {
        if (files.length > 0) {
          let reader = new FileReader();

          reader.onload = (e) => {
            $scope.$apply(() => {
              this.cropImgSrc = e.target.result;
              this.myCroppedImage = '';
            });
          };

          reader.readAsDataURL(files[0]);
        }
        else {
          this.cropImgSrc = undefined;
        }
      };

      this.saveCroppedImage = () => {
        if (this.myCroppedImage !== '') {
          Images.insert(this.myCroppedImage, (err, fileObj) => {
            if (!this.newProduct.images) {
              this.newProduct.images = [];
            }

            this.newProduct.images.push(fileObj);
            this.cropImgSrc = undefined;
            this.myCroppedImage = '';
          });
        }
      };

      this.updateDescription = ($data, image) => {
        Images.update({_id: image._id}, {$set: {'metadata.description': $data}});
      };
    }
  }
});