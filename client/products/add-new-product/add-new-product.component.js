angular.module('socially').directive('addNewProduct', function () {
  return {
    restrict: 'E',
    templateUrl: 'client/products/add-new-product/add-new-product.html',
    controllerAs: 'addNewProduct',
    controller: function ($scope, $stateParams, $reactive, $mdDialog) {
      $reactive(this).attach($scope);

      this.helpers({
        isLoggedIn: () => {
          return Meteor.userId() !== null;
        }
      });
      this.unitBlock = {};
      this.categoryBlock = {};
      this.specialBlock = [];
      this.specialTemp = {};
      this.specialShow=false;
      this.newCategory=0;
      this.newSubcategory=0;
      this.newBrand=0;

      //Use Dummy before converting into handlers
      this.Categories = [{
        name: 'BEBIDAS',
        subcategory: [{
          name: 'Bebidas Calientes'
          },{
          name: 'Bebidas Frias'
          },{
          name: 'Bebidas Frappés'
          },{
          name: 'NUEVA'
          }]
        },{
        name: 'ENTRADAS',
          subcategory: [
          {
          name: 'NUEVA'
          }
          ]
        },{
        name: 'PLATOS FUERTES',
          subcategory: [{
            name: 'Aves'
            },
            {
            name: 'Cortes'
            },{
            name: 'Pizzas'
            },{
            name: 'NUEVA'
            }]
        },
        {
        name: 'NUEVA',
         subcategory: [{
          name: 'NUEVA'
        }]
        }];

      this.Subcategories = {};
      this.Brands = [
        {name: 'Coca-Cola'},
        {name: 'Pepsi'},
        {name: 'Pascual'},
        {name: 'NUEVA'}
        ];

      this.unidades = [
        { type: 1, name: 'Gramos' },
        { type: 1, name: 'Mililitros' },
        { type: 1, name: 'Kilogramos' },
        { type: 1, name: 'Litros' },
        { type: 2, name: 'Taza' },
        { type: 2, name: 'Vaso' },
        { type: 2, name: 'Lata' }
      ];
      //Unidades must be converted into product as string
      //Save especial into newProduct from start
      this.newProduct = {};
      this.newProduct.especial = {};

      this.newSpecial = (specialTemp) => {
        if(specialTemp.name && specialTemp.value){
          this.specialBlock.push(angular.copy(specialTemp));
          console.log('New Parameter: ', this.specialBlock);
          this.specialTemp={};
        }         
      }

      this.addSpecial = (specialBlock)=>{
        newProduct = this.newProduct;
        for (var i = specialBlock.length - 1; i >= 0; i--) {
          newProduct.especial[specialBlock[i].name]=specialBlock[i].value;
        };

      }

      this.addNewProduct = () => {
        this.newProduct.owner = Meteor.userId();
        this.newProduct.public = true; //Remove after development testing
        this.newProduct.images = (this.newProduct.images || []).map((image) => {
          return image._id;
        });

        // ====== Beguin newProduct processing routine
        // a New category always has a New Subcategory
        if(!this.newSubcategory){
          // If still 0, no new Subcategory
          this.newProduct.subcategory=this.categoryBlock.Subname;

        }else if(this.newCategory){
          // If newCategory and newSubcategory, push a new category-Sub complex
          this.newProduct.subcategory=this.newSubcategory;
          this.newProduct.category=this.newCategory;
          // **** ADD INSERT INSTRUCTION HERE


        }else{
          // New Subcategory, update the category's subcategory array
          this.newProduct.subcategory=this.newSubcategory;
          // **** ADD UPDATE INSTRUCTION HERE

        };
        if(!this.newCategory){
          // If still 0, no new Category
          this.newProduct.category=this.categoryBlock.name;

        }else{
          // If newCategory and newSubcategory, push a new category-Sub complex
          this.newProduct.category=this.newCategory;
          // **** ADD INSERT INSTRUCTION HERE

        }
        if(!this.newBrand){
          // If still 0, no new Brand
          this.newProduct.brand=this.categoryBlock.Brandname;

        }else{
          // New Brand, insert new Brand to Brands COllection
          this.newProduct.brand=this.newBrand;
          // **** ADD INSERT INSTRUCTION HERE

        }
        // ------ End category, brand & sub categorization
        if (this.isSerial) {
          // statement for serial products, add serie and drop cantidad to 1
          this.newProduct.masterType='Serie';
          this.newProduct.serie=this.serial;
          this.newProduct.cantidad=1;
        }else{
          this.newProduct.masterType='Lote';
          this.newProduct.serie=undefined;
        }
        // ------ End masterType assignemnt
        if(this.specialBlock.length > 0){
          // New especial arguments, verify especial object exists, create it otherwise
          this.newProduct.especial = (this.newProduct.especial || {})
          for (var i = this.specialBlock.length - 1; i >= 0; i--) {
            this.newProduct.especial[this.specialBlock[i].name]=this.specialBlock[i].value;
            // Use Dot notation to save special key values to especial parameter
          };

        }else{
          // No New especial arguments
          this.newProduct.especial={};

        }
        if(this.unitBlock.type==1){
          this.newProduct.units=this.unitBlock.value+this.unitBlock.name;
        }else{
          this.newProduct.units=this.unitBlock.name;
        }
        this.newProduct.date= new Date();
        //Date Object constructor, can use ().getMonth(), etc.

        Products.insert(this.newProduct);
        console.log('All Hail a new Product! ', this.newProduct);
        // Reset all states dependant on ng-show/hide after inser
        this.newProduct = {};
        this.unitBlock = {};
        this.categoryBlock = {};
        this.specialBlock = [];
        this.specialTemp = {};
        this.specialShow=false;
        this.newCategory=0;
        this.newSubcategory=0;
        this.newBrand=0;

        $mdDialog.hide();
      // ====== END newProduct processing routine
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