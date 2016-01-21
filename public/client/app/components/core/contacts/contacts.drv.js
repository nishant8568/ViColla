/**
 * Created by nishant on 11/29/2015.
 */
contactsModule.directive('contacts', function () {
    return {
        restrict: 'E',
        templateUrl: 'app/components/core/contacts/contacts.tpl.html',
        controller: 'contactsController',
        controllerAs: 'contactsCtrl',
        bindToController: true

    }
});