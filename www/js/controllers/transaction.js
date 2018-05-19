// Copyright (c) 2010-2018 The Bitcoin developers
// Original code was distributed under the MIT software license.
// Copyright (c) 2014-2018 TEDLab Sciences Ltd
// Tedchain code distributed under the GPLv3 license, see COPYING file.

var module = angular.module("TedchainWallet.Controllers");
var sdk = require("tedchain");
var RecordKey = sdk.RecordKey;
var encoding = sdk.encoding;

// ***** TransactionController *****
// *********************************

module.controller("TransactionInfoController", function ($scope, $rootScope, $routeParams, $route, $q, controllerService, endpointManager) {

    if (!controllerService.checkState())
        return;

    $rootScope.selectedTab = "home";

    var mutationHash = $routeParams.hash;
    var transactions = [];
    $scope.transactions = transactions;
    $scope.endpoints = endpointManager.endpoints;

    $scope.setEndpoint = function (endpoint) {
        $scope.selectedRootUrl = endpoint.rootUrl;
    }

    for (var key in endpointManager.endpoints) {
        $scope.setEndpoint(endpointManager.endpoints[key]);
        break;
    }

    function loadEndpoint(key) {
        var endpoint = endpointManager.endpoints[key];
        
        endpoint.apiService.getTransaction(mutationHash).then(function (result) {
            if (result == null) {
                transactions.push({ endpoint: endpoint, success: false });
            }
            else {
                var parsedTransaction = {
                    success: true,
                    mutationHash: result.mutationHash.toHex(),
                    transactionHash: result.transactionHash.toHex(),
                    namespace: result.mutation.namespace.toHex(),
                    memo: getMemo(result.mutation.metadata),
                    acc_records: [],
                    data_records: [],
                    endpoint: endpoint,
                    date: moment(result.transaction.timestamp.toString(), "X").format("MMMM Do YYYY, hh:mm:ss")
                };

                $q.all(result.mutation.records.map(function (record) {
                    var key = RecordKey.parse(record.key);
                    if (key.recordType == "ACC") {
                        return endpoint.apiService.getAccountRecord(key.path.toString(), key.name, record.version).then(function (previousRecord) {
                            var newValue = record.value == null ? null : encoding.decodeInt64(record.value.data);
                            parsedTransaction.acc_records.push({
                                key: key,
                                valueDelta: newValue == null ? null : newValue.subtract(previousRecord.balance),
                                value: newValue
                            });
                        });
                    } else if (key.recordType == "DATA") {
                        parsedTransaction.data_records.push({
                            key: key,
                            value: record.value == null ? null : encoding.decodeString(record.value.data)
                        });
                    }
                })).then(function (result) {
                    transactions.push(parsedTransaction);
                    $scope.setEndpoint(endpoint);
                });
            }

        });
    }

    function getMemo(metadata) {
        try {
            var decodedMetadata = JSON.parse(encoding.decodeString(metadata));
            return decodedMetadata.memo;
        }
        catch (e) {
            return null;
        }
    }

    for (var key in endpointManager.endpoints) {
        loadEndpoint(key);
    }
});
