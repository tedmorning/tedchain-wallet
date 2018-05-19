// Copyright (c) 2010-2018 The Bitcoin developers
// Original code was distributed under the MIT software license.
// Copyright (c) 2014-2018 TEDLab Sciences Ltd
// Tedchain code distributed under the GPLv3 license, see COPYING file.

var app =
    angular.module('TedchainWallet', [
        "ngRoute",
        "TedchainWallet.Models",
        "TedchainWallet.Controllers",
        "TedchainWallet.Services",
        "treeControl"
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "views/home.html",
                controller: "HomeController"
            })
            .when("/submit", {
                templateUrl: "views/submit.html",
                controller: "SubmitController"
            })
            .when("/signin", {
                templateUrl: "views/signin.html",
                controller: "SignInController"
            })
            .when("/manageassets", {
                templateUrl: "views/manageassets.html",
                controller: "ManageAssetsController"
            })
            .when("/addendpoint", {
                templateUrl: "views/addendpoint.html",
                controller: "AddEndpointController"
            })
            .when("/admin", {
                templateUrl: "views/admin.html",
                controller: "AdminController"
            })
            .when("/transaction/:hash", {
                templateUrl: "views/transaction.html",
                controller: "TransactionInfoController"
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .directive("assetItem", function () {
        return {
            restrict: 'A',
            templateUrl: 'views/directives/assetitem.html',
            replace: false
        };
    })
    .run(function ($rootScope, $window) {
        $rootScope.logOut = function () { $window.location.reload(); };
    });

angular.module("TedchainWallet.Controllers", []);