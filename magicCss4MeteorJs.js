Members = new Meteor.Collection('members');

if (Meteor.isClient) {
  MembersCollectionState = {};

  // Remove authorized only if property removeAnimationPlayed set to true
  // @TODO find a way to store that data ouside the document property
  // @TODO remove animation should also change that property and then recall the remove function

  membersList = Members.find({}, {sort: {date: 1}});
 
  membersList.observe({
    added: function (newDocument) {
	MembersCollectionState[newDocument._id] = 'added';
	// in fact i pass in added when item has been removed and that remove has been denied by server, so it's added again on client-side
	if (newDocument.removeAnimationPlayed === false) {
          MembersCollectionState[newDocument._id] = 'removed';
        }
console.log('Members added: ', this, newDocument);
    },

    removed: function (oldDocument) {
	MembersCollectionState[oldDocument._id] = 'removed';
console.log('Members removed: ', this, oldDocument);
	/*
	var el = $('#'+oldDocument._id);
	el.before('<div>ByBye</div>'); // will be removed at the same time as the main template... what am i doing wrong ?
	*/
    },

    changed: function (newDocument, oldDocument) {
	// default behavior
	MembersCollectionState[newDocument._id] = 'changed';
	if (newDocument.removeAnimationPlayed === false) {
	  MembersCollectionState[newDocument._id] = 'removed';
	}
console.log('Members changed: ', this, newDocument, oldDocument);
    }
  });

  Template.container.inList = function () {
    return membersList;
  };

  Template.item.created = function () {
console.log('tpl item created: ', this);
  };

  Template.item.destroyed = function () {
console.log('tpl item destroyed: ', this);
  };

  Template.item.rendered = function () {
    var item = this.data;
    switch (MembersCollectionState[item._id]) {
	case 'added':
	  if (item.removeAnimationPlayed === undefined) {
	    $('#' + item._id).removeClass().addClass('magictime swashIn');
	  }
	  break;
	// ne fonctionne pas car c'est un callback après rendered.
	// test de déplacement dans le observe.removed, pas mieux
	// test avec remplacement du DOM via jQuery ($('#{{_id}}').replaceChild(monNouveaudom)): id="{{_id}}" par id="removed_{{_id}}" => Meteor va quand même supprimer le noeud
	// test en rajoutant un noeud avant via jQuery ($('#{{_id}}').before(monNouveauDom)): Meteor supprime quand même ce noeud qui est pourtant en dehors du noeud géré
	case 'removed':
	  // play animation
	  $('#' + item._id).removeClass().addClass('magictime swashOut');
	  // and remove finally the item
	  Meteor.setTimeout(function () {
		Members.update(item._id, {$set: {removeAnimationPlayed: true}}, function () {
		  Members.remove(item._id);
		});
	  }, 1000);
	  break;
	case 'changed':
	  $('#' + item._id).removeClass().addClass('magictime vanishIn');
	  break;
	default:
    }
console.log('tpl item rendered: ', this, MembersCollectionState[item._id]);

    // clear status
    MembersCollectionState[item._id] = null;
  };

  Template.container.inList = function () {
    return membersList;
  };

  Template.container.created = function () {
console.log('tpl container created: ', this);
  };

  Template.container.destroyed = function () {
console.log('tpl container destroyed: ', this);
  };

  Template.container.rendered = function () {
console.log('tpl container rendered: ', this);
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

    Members.allow({
    insert: function (userId, document) {
console.log('Members allow insert: ', document._id);
        return true;
    },

    remove: function (userId, document) {
console.log('Members allow remove: ', document._id);
	if (document.removeAnimationPlayed === true) {
          return true;
	} else {
	  Members.update(document._id, {$set: {removeAnimationPlayed: false}});
	  return false;
	}
    },

    update: function (userId, doc, fields, modifier) {
        return true;
    }
  });
}
