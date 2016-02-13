Meteor.startup(function () {
  console.log('Number of products is: ', Products.find().count());
  if (Products.find().count() === 0) {
    var products = [
      {
        'name': 'Dubstep-Free Zone',
        'description': 'Fast just got faster with Nexus S.'
      },
      {
        'name': 'All dubstep all the time',
        'description': 'Get it on!'
      },
      {
        'name': 'La Nouvelle Bowie Partei',
        'description': 'Bowie never died, bowie is just asleep.',
        'owner': 'TaB9pxNPutjeAnGux',
        'public': true,
      }
    ];

    for (var i = 0; i < products.length; i++) {
      Products.insert(products[i]);
    }
  }else{
    //Returns the last product for shcema example
    console.log(Products.find().fetch()[Products.find().count()-1]);
  }
});
