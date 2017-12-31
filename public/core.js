var libApp = angular.module('libAppUtsav', ['angularUtils.directives.dirPagination','ngRoute']);

libApp.config(['$routeProvider', '$locationProvider',function($routeProvider, $locationProvider){
  $routeProvider
  .when("/checkIn",
    {
      templateUrl: "checkIn.html",
      controller: "checkInCtrl",
      controllerAs: "libApp"
    })
  .when("/checkOut/:isbn/:branch_id/:remaining_copy/:title",
    {
      templateUrl: "checkOut.html",
      controller: "checkOutCtrl",
      controllerAs: "bk"
    })
   .when("/borrower",
    {
      templateUrl: "borrower.html",
      controller: "borrowerCtrl",
      controllerAs: "libApp"
    })
    .when("/contact",
    {
      templateUrl: "contact.html",
      controller: "",
      controllerAs: "libApp"
    })
  .when("/search",
    {
      templateUrl: "search.html",
      controller: "searchCtrl",
      controllerAs: "libApp"
    })
  .otherwise(
    {
      templateUrl: "main.html",
      controller: "homeCtrl",
      controllerAs: "libApp"
    });
}])
.controller('MainCtrl', ['$route', '$routeParams', '$location','$scope','$http',
  function($route, $routeParams, $location,$scope,$http) {
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;
       $scope.formData = {};
}])
.controller('homeCtrl', ['$route', '$routeParams', '$location','$scope','$http',
  function($route, $routeParams, $location,$scope,$http) {
   console.log("Inside homeCtrl");
  $scope.test=function(){
    console.log("Inside test function");
  }
}])

.controller('checkInCtrl', ['$routeParams', function($routeParams) {
  this.name = "checkInCtrl";
  this.params = $routeParams;
}])
.controller('borrowerCtrl', ['$routeParams','$scope','$http', function($routeParams,$scope,$http) {
    $scope.form1={};
    $scope.message="";
 $scope.register=function(){
 $http.post('/lib/register', $scope.form1)
            .success(function(data) {
                $scope.form1 = {}; // clear the form so our user is ready to enter another
                $scope.user = data;
             
                console.log($scope.user + "---"+$scope.user.flag);
              
                     if( $scope.user.flag===1){
                  $scope.message="User Registered Successfully!!";
                  console.log("User Registered");
            }else if ( $scope.user.flag===0){
                   $scope.message="Duplicate User!!";
            };
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
 };
}])
.controller('searchCtrl', ['$routeParams','$scope','$http', function($routeParams,$scope,$http) {
  console.log("In search control");
  this.name = "searchCtrl";
  this.params = $routeParams;
    $scope.formData = {};
    $scope.sort = function(keyname){
        console.log("In sort function");
        $scope.sortKey = keyname;   //set the sortKey to the param passed
        $scope.reverse = !$scope.reverse; //if true make it false and vice versa
    }
    $scope.searchLib = function() { 
       console.log("In search function");
       console.log($scope.formData.book + " "+$scope.formData.author + " "+$scope.formData.isbn+" " + $scope.formData.contains );
        $http.post('/lib/search',$scope.formData).success(function(data) {
                // clear the form so our user is ready to enter another
                $scope.books = data;
                console.log(data);
                console.log("Search successful");
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
  };
}])
.controller('checkOutCtrl',['$routeParams', '$scope','$http', function($routeParams,$scope,$http) {
  console.log("Inside checkout")
  this.name = "checkOutCtrl";
  $scope.bkParams = $routeParams;
  console.log($scope.bkParams+"--");
  $scope.checkOut = function() { 
        console.log("in checkOut");
        $http.post('/lib/checkOut', $scope.bkParams)
            .success(function(data) {
                $scope.loan = data;
                console.log(data);
                console.log($scope.loan + "---"+$scope.loan[0].count);
                $scope.message1=$scope.loan[0].message1;
                  /*   if( $scope.loan.flag===1){
                            $scope.message1="Book Issue Successful!!";
                            console.log("User Registered");
                      }else if ( $scope.loan.flag===0){
                           
                      };*/
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
  };
}]);