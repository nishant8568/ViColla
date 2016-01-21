/**
 * Created by nishant on 11/21/2015.
 */
headerModule.directive('header', function() {
   return {
       restrict: "E",
       templateUrl: "app/components/others/header/header.tpl.html",
       controller: "HeaderController"
   }
});