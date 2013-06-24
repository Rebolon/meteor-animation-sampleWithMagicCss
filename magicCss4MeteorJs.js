Members = new Meteor.Collection('members');

if (Meteor.isClient) {
  MembersCollectionState = {};
  membersList = Members.find({}, {sort: {date: 1}});
 
  membersList.observe({
    added: function (newDocument) {
	MembersCollectionState[newDocument._id] = 'added';
console.log('Members added: ', this, newDocument);
    },

    removed: function (oldDocument) {
	MembersCollectionState[oldDocument._id] = 'removed';
        $('#' + oldDocument._id).innerHtml 
    },

    changed: function (newDocumentId, oldDocumentId) {
        MembersCollectionState[newDocumentId._id] = 'changed';
console.log('Members changed: ', this, newDocumentId, oldDocumentId);
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
	  $('#' + item._id).removeClass().addClass('magictime swashIn');
	  break;
	// ne fonctionne pas car c'est un callback après rendered.
	// test de déplacement dans le observe.removed, pas mieux
	// test avec remplacement du DOM via jQuery ($('#{{_id}}').replaceChild(monNouveaudom)): id="{{_id}}" par id="removed_{{_id}}" => Meteor va quand même supprimer le noeud
	// test en rajoutant un noeud avant via jQuery ($('#{{_id}}').before(monNouveauDom)): Meteor supprime quand même ce noeud qui est pourtant en dehors du noeud géré
	case 'removed':
	  $('#' + item._id).removeClass().addClass('magictime swashOut');
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
}
