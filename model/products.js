Products = new Mongo.Collection("products");

Products.allow({
  insert: function (userId, product) {
    return userId && product.owner === userId;
  },
  update: function (userId, product, fields, modifier) {
    return userId && product.owner === userId;
  },
  remove: function (userId, product) {
    return userId && product.owner === userId;
  }
});

let getContactEmail = function (user) {
  if (user.emails && user.emails.length)
    return user.emails[0].address;

  if (user.services && user.services.facebook && user.services.facebook.email)
    return user.services.facebook.email;

  return null;
};

Meteor.methods({
  invite: function (productId, userId) {
    check(productId, String);
    check(userId, String);

    let product = Products.findOne(productId);

    if (!product)
      throw new Meteor.Error(404, "No such product!");

    if (product.owner !== this.userId)
      throw new Meteor.Error(404, "No permissions!");

    if (product.public)
      throw new Meteor.Error(400, "That product is public. No need to invite people.");

    if (userId !== product.owner && !_.contains(product.invited, userId)) {
      Products.update(productId, {$addToSet: {invited: userId}});

      let from = getContactEmail(Meteor.users.findOne(this.userId));
      let to = getContactEmail(Meteor.users.findOne(userId));

      if (Meteor.isServer && to) {
        Email.send({
          from: "noreply@socially.com",
          to: to,
          replyTo: from || undefined,
          subject: "PARTY: " + product.title,
          text: "Hey, I just invited you to '" + product.title + "' on Socially." +
          "\n\nCome check it out: " + Meteor.absoluteUrl() + "\n"
        });
      }
    }
  },
  rsvp: function (productId, rsvp) {
    check(productId, String);
    check(rsvp, String);

    if (!this.userId)
      throw new Meteor.Error(403, "You must be logged in to RSVP");

    if (!_.contains(['yes', 'no', 'maybe'], rsvp))
      throw new Meteor.Error(400, "Invalid RSVP");

    let product = Products.findOne(productId);

    if (!product)
      throw new Meteor.Error(404, "No such product");

    if (!product.public && product.owner !== this.userId && !_.contains(product.invited, this.userId))
      throw new Meteor.Error(403, "No such product"); // its private, but let's not tell this to the user

    let rsvpIndex = _.indexOf(_.pluck(product.rsvps, 'user'), this.userId);

    if (rsvpIndex !== -1) {
      // update existing rsvp entry
      if (Meteor.isServer) {
        // update the appropriate rsvp entry with $
        Products.update(
          {_id: productId, "rsvps.user": this.userId},
          {$set: {"rsvps.$.rsvp": rsvp}});
      } else {
        // minimongo doesn't yet support $ in modifier. as a temporary
        // workaround, make a modifier that uses an index. this is
        // safe on the client since there's only one thread.
        let modifier = {$set: {}};
        modifier.$set["rsvps." + rsvpIndex + ".rsvp"] = rsvp;

        Products.update(productId, modifier);
      }
    } else {
      // add new rsvp entry
      Products.update(productId,
        {$push: {rsvps: {user: this.userId, rsvp: rsvp}}});
    }
  }
});