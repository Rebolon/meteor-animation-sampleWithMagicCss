Members = new Meteor.Collection('members');

/**
 * 
 * mandatory: div to animate must have id like #{{_id}} to enable the animatorAutomation to retreive them
 */
animatorAutomation = {
	collectionState: {},

	effectOnAdded: function (selector, item) {
	  // check to prevent effect when added coz removed has been refused server-side
	  if (item._removeAnimationPlayed === undefined) {
            $(selector).removeClass().addClass('magictime swashIn');
          }
	},

	effectOnRemoved: function (selector, item, timeout) {
	  // play animation
          $(selector).removeClass().addClass('magictime swashOut');
          // and remove finally the item
          Meteor.setTimeout(function () {
            Members.update(item._id, {$set: {_removeAnimationPlayed: true}}, function () {
              Members.remove(item._id);
            });
          }, timeout);
	},

	effectOnChanged: function (selector, item) {
	  $(selector).removeClass().addClass('magictime vanishIn');
	},

	alterTemplate: function (tpl, timeout) {
	  var self = this;
	  timeout = timeout || 1000;

	  tpl.rendered = function () {
	    var item = this.data;
	    switch (self.collectionState[item._id]) {
	        case 'added':
		  self.effectOnAdded('#' + item._id, item);
	          break;
	        case 'removed':
		  self.effectOnRemoved('#' + item._id, item, timeout);
	          break;
	        case 'changed':
		  self.effectOnChanged('#' + item._id);
	          break;
	        default:
	    }

	    // clear status
	    self.collectionState[item._id] = null;
	  };
	},

	alterCursorObserver: function (cursor) {
	    var self = this;
	    cursor.observe({
	      added: function (newDocument) {
		// default behavior
	        self.collectionState[newDocument._id] = 'added';
		// added for a removed next step coz first removed has been refused server-side
	        if (newDocument._removeAnimationPlayed === false) {
	          self.collectionState[newDocument._id] = 'removed';
	        }
	      },
	
	      removed: function (oldDocument) {
	        self.collectionState[oldDocument._id] = 'removed';
	      },
	
	      changed: function (newDocument, oldDocument) {
	        // default behavior
	        self.collectionState[newDocument._id] = 'changed';
		// changed for a removed next step
	        if (newDocument._removeAnimationPlayed === false) {
	          self.collectionState[newDocument._id] = 'removed';
	        }
	      }
	  });
	},

	alterCollectionAllow: function (collection) {
	  // default behavior on insecure mode
	  if (!collection._validators
		|| !collection._validators.insert.allow
		|| collection._validators.insert.allow.length < 1) {
	    collection.allow({
		insert: function (userId, document) {
		  return true;
		}
	    });
	  }

	  if (!collection._validators
                || !collection._validators.update.allow
		|| collection._validators.update.allow.length < 1) {
            collection.allow({
                update: function (userId, document) {
                  return true;
                }
            });
          }

	  // behavior for the animation
	  collection.allow({
	    remove: function (userId, document) {
	        if (document._removeAnimationPlayed === true) {
	          return true;
	        } else {
	          collection.update(document._id, {$set: {_removeAnimationPlayed: false}});
	          return false;
	        }
	    }
	  });
	}
  };
 
if (Meteor.isClient) {
  Meteor.startup(function () {

  });

  // Remove authorized only if property removeAnimationPlayed set to true
  // @TODO find a way to store that data ouside the document property
  // @TODO remove animation should also change that property and then recall the remove function

  membersList = Members.find({}, {sort: {date: 1}});

  animatorAutomation.alterTemplate(Template.item);
  animatorAutomation.alterCursorObserver(membersList);

  Template.item.created = function () {
//@TODO use created to set a var that will disable animation of first render ?
console.log('tpl item created: ', this);
  };

  Template.container.inList = function () {
    return membersList;
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

  animatorAutomation.alterCollectionAllow(Members);
}
