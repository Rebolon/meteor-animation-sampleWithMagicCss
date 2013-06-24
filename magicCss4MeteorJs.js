// The collection for the test
Members = new Meteor.Collection('members');

if (Meteor.isClient) {
  Meteor.startup(function () {
  });

  // The cursor
  membersList = Members.find({}, {sort: {date: 1}});

  // #1 alter the template to animate
  animatorAutomation.alterTemplate(Template.item);

  // #2 alter the cursor used by the template
  animatorAutomation.alterCursorObserver(membersList);

  // The helper that return the cursor (for the forEach)
  Template.container.inList = function () {
    return membersList;
  };

/*  Template.item.created = function () {
//@TODO maybe use created to set a var that will disable animation of first render ?
  };*/
}

if (Meteor.isServer) {
  Meteor.startup(function () {
  });

  // #3 on server side, alter the Collection
  animatorAutomation.alterCollectionAllow(Members);
}
