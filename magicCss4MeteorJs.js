Members = new Meteor.Collection('members');

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
