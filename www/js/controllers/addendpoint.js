// Copyright (c) 2010-2018 The Bitcoin developers
// Original code was distributed under the MIT software license.
// Copyright (c) 2014-2018 TEDLab Sciences Ltd
// Tedchain code distributed under the GPLv3 license, see COPYING file.

var module = angular.module("TedchainWallet.Controllers");

// ***** AddEndpointController *****
// *********************************

module.controller("AddEndpointController", function ($scope, $rootScope, $location, Endpoint, settings, controllerService, endpointManager) {

    if (!controllerService.checkState())
        return;

    $rootScope.selectedTab = "none";
    $scope.hasNoEndpoint = Object.keys(endpointManager.endpoints).length === 0;
    $scope.httpRedirect = settings.httpRedirect;

    $scope.check = function () {
        if ($scope.endpointUrl.slice(-1) != "/")
            var endpointUrl = $scope.endpointUrl + "/";
        else
            var endpointUrl = $scope.endpointUrl;

        var endpoint = new Endpoint(endpointUrl);

        if (location.protocol === "https:" && endpointUrl.slice(0, 5) === "http:") {
            $scope.addEndpointForm.endpointUrl.$setValidity("connectionError", false);
            $scope.endpointError = "nonsecure";
            return;
        }

        endpoint.loadEndpointInfo().then(function (result) {
            $scope.endpoint = result;

            if (!result.properties.validatorUrl) {
                $scope.noMetadata = true;
            }
            else if (result.properties.validatorUrl != result.rootUrl) {
                $scope.rootUrlWarning = true;
            }
            else {
                $scope.success = true;
            }
        }).then(function () { }, function () {
            $scope.addEndpointForm.endpointUrl.$setValidity("connectionError", false);
            $scope.endpointError = "unreachable";
        });
    };

    $scope.changeUrl = function () {
        $scope.addEndpointForm.endpointUrl.$setValidity("connectionError", true);
    };

    $scope.confirm = function () {
        endpointManager.addEndpoint($scope.endpoint);
        $location.path("/");
    };
});
