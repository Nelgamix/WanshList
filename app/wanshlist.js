function Good (brand = "", model = "", type = "", price = 0, priority = 0, link = "", creationDate = undefined, buyDate = "", rating = 0) {
    if (!creationDate) { creationDate = new Date(); }
    if (typeof brand === 'object') {
        this.brand = brand.brand;
        this.model = brand.model;
        this.type = brand.type;
        this.price = brand.price;
        this.priority = brand.priority;
        this.link = brand.link;
        this.creationDate = brand.creationDate;
        this.buyDate = brand.buyDate;
        this.rating = brand.rating;
    } else {
        this.brand = brand;
        this.model = model;
        this.type = type;
        this.price = price;
        this.priority = priority;
        this.link = link;
        this.creationDate = creationDate;
        this.buyDate = buyDate;
        this.rating = rating;
    }
}

// Setters
Good.prototype.setBrand = function (brand) { this.brand = brand; };
Good.prototype.setModel = function (model) { this.model = model; };
Good.prototype.setType = function (type) { this.type = type; };
Good.prototype.setPrice = function (price) { this.price = price; };
Good.prototype.setPriority = function (priority) { this.priority = priority; };
Good.prototype.setLink = function (link) { this.link = link; };
Good.prototype.setCreationDate = function (creationDate) { this.creationDate = creationDate; };
Good.prototype.setBuyDate = function (buyDate) { this.buyDate = buyDate; };
Good.prototype.setRating = function (rating) { this.rating = rating; };

// Getters
Good.prototype.getBrand = function () { if (this.brand !== undefined && this.brand !== "") { return this.brand; } else { return "--"; } };
Good.prototype.getModel = function () { if (this.model !== undefined && this.model !== "") { return this.model; } else { return "--"; } };
Good.prototype.getType = function () { if (this.type !== undefined && this.type !== "") { return this.type; } else { return "--"; } };
Good.prototype.getPrice = function () { if (this.price !== undefined && this.price !== "") { return this.price; } else { return 0; } };
Good.prototype.getPriority = function () { if (this.priority !== undefined && this.priority !== "") { return this.priority; } else { return 0; } };
Good.prototype.getLink = function () { if (this.link !== undefined && this.link !== "") { return this.link; } else { return "--"; } };
Good.prototype.getCreationDate = function () { if (this.creationDate !== undefined && this.creationDate !== "") { this.verifyDate(); return this.creationDate.toLocaleString(); } else { return "--"; } };
Good.prototype.getBuyDate = function () { if (this.buyDate !== undefined && this.buyDate !== "") { this.verifyDate(); return this.buyDate.toLocaleString(); } else { return "--"; } };
Good.prototype.getRating = function () { if (this.rating !== undefined && this.rating !== "") { return this.rating; } else { return "--"; } };

Good.prototype.verifyDate = function () {
    if (this.creationDate && !(this.creationDate instanceof Date)) { this.creationDate = new Date(this.creationDate); }
    if (this.buyDate && !(this.buyDate instanceof Date)) { this.buyDate = new Date(this.buyDate); }
};

// Methods
Good.prototype.randomize = function () {
    var brands = ['Carrefour', 'Decathlon', 'Liddle', 'Star Wars', 'Amazon'];
    var models = ['Triangle', 'Carré', 'Rectangle', 'Parallèle', 'Arceau'];
    var types = ['Vélos', 'Voitures', 'Livres', 'Bureautique', 'Jardinage'];

    this.setBrand(brands[window.Math.floor(window.Math.random() * brands.length)]);
    this.setModel(models[window.Math.floor(window.Math.random() * models.length)]);
    this.setType(types[window.Math.floor(window.Math.random() * types.length)]);
    this.setPrice(window.Math.floor(window.Math.random() * 100 + 10));
};

angular.module('WanshList', ['ngAnimate', 'ngCookies', 'ui.bootstrap'])
.controller('WanshListCtrl', function ($scope, $uibModal, $cookies, focus) {
    var getTotal = function () {
        let t = 0;
        for (g of this.goods) { if (g instanceof Good) { t += g.getPrice(); } else { console.warn('Error: g instance of ' + typeof t) } }
        return t;
    };

    $scope.organize = function (list, type) {
        let l = $scope.lists[list].goods;
        if (type === "brand" || type === "model" || type === "type" || type === "price" || type === "priority") {
            if (!$scope.lists[list].sorts[type]) {
                $scope.lists[list].sorts[type] = true;
                l.sort(function (a, b) {
                    return a[type] > b[type];
                });
            } else {
                $scope.lists[list].sorts[type] = false;
                l.sort(function (a, b) {
                    return a[type] < b[type];
                });
            }
        }
    };

    var save = function (list) {
        $cookies.putObject(list, $scope.lists[list].goods);
    };

    var get = function (list) {
        let d = $cookies.getObject(list);
        if (d) { for (o of d) { $scope.lists[list].goods.push(new Good(o)); } }
    };

    var saveSettings = function () {
        $cookies.putObject('settings', $scope.settings);
    };

    var getSettings = function () {
        let d = $cookies.getObject('settings');
        if (d) { $scope.settings = d; }
    };

    $scope.editGood = function (list, index) {
        var editGoodInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editGood.html',
            controller: 'EditGoodCtrl',
            size: 'lg',
            resolve: {
                good: function () {
                    return $scope.lists[list].goods[index];
                },
                list: function () {
                    return list;
                },
                index: function () {
                    return index;
                }
            }
        });

        editGoodInstance.result.then(function (pack) {
            if (pack && pack.action && pack.good) {
                let slist = $scope.lists[pack.slist];
                let dlist = $scope.lists[pack.dlist];

                if (pack.action === "edit" && pack.slist && pack.index !== undefined) {
                    slist.goods[pack.index] = pack.good;
                } else if (pack.action === "delete" && pack.slist) {
                    slist.goods.splice(pack.index, 1);
                } else if (pack.action === "transfert" && pack.slist && pack.dlist) {
                    if (pack.dlist === "wantlist") { pack.good.setPriority(0); }
                    if (pack.slist === "bought") { pack.good.setRating(0); }
                    if (pack.slist === "bought") { pack.good.setBuyDate(""); }
                    if (pack.dlist === "bought") { pack.good.setBuyDate(new Date()); }
                    dlist.goods.push(pack.good);
                    slist.goods.splice(pack.index, 1);
                }
            }

            if (pack.slist) { save(pack.slist); }
            if (pack.dlist) { save(pack.dlist); }
        }, function (action) {
            console.info('Edit good dismissed: ' + action);
        });
    };

    $scope.find = function () {
        var findInstance = $uibModal.open({
            animation: true,
            templateUrl: 'find.html',
            controller: 'FindCtrl',
            size: 'lg',
            resolve: {
                lists: function () {
                    return $scope.lists;
                }
            }
        });
    };

    $scope.setting = function () {
        var settingsInstance = $uibModal.open({
            animation: true,
            templateUrl: 'settings.html',
            controller: 'SettingsCtrl',
            size: 'lg',
            resolve: {
                settings: function () {
                    return $scope.settings;
                }
            }
        });

        settingsInstance.result.then(function (settings) {
            if (settings) {
                $scope.settings = settings;
                saveSettings();
            }
        }, function (action) {
            console.info('Settings dismissed: ' + action);
        });
    };

    $scope.record = function (table) {
        let list = $scope.lists[table];
        let entry = list.entry;

        if (entry.type && entry.price) { // Check entries
            entry.brand = entry.brand ? entry.brand : "";
            entry.model = entry.model ? entry.model : "";
            entry.link = entry.link ? entry.link : "";
            entry.priority = entry.priority ? entry.priority : 0; // Priority is not always here
            entry.creationDate = new Date();
            let good = new Good(entry.brand, entry.model, entry.type, entry.price, entry.priority, entry.link, entry.creationDate); // Create the good
            list.goods.push(good); // Push it

            // Clear the inputs
            entry.brand = "";
            entry.model = "";
            entry.type = "";
            entry.price = "";
            entry.priority = "";
            entry.link = "";
        }

        if (table === "wishlist") { focus('wishlistPriority'); }
        else if (table === "wantlist") { focus('wantlistBrand'); }

        save(table);
    };

    $scope.stylize = function (good) {
        let s = {};
        let t = $scope.settings.priceColors;

        if (t.one.color && good.price <= t.one.threshold) {
            s.color = t.one.color;
        } else if (t.two.color && good.price <= t.two.threshold) {
            s.color = t.two.color;
        } else if (t.three.color && good.price <= t.three.threshold) {
            s.color = t.three.color;
        } else if (t.four.color && good.price <= t.four.threshold) {
            s.color = t.four.color;
        } else if (t.five.color && good.price <= t.five.threshold) {
            s.color = t.five.color;
        }

        return s;
    };

    $scope.classize = function () {
        let s = "col-sm-";
        let v = $scope.settings.view;

        if (v === "block") {
            s += "4";
        } else if (v === "line") {
            s += "12";
        } else if (v === "dual") {
            s += "6";
        }

        return s;
    };

    $scope.lists = {
        wishlist: {
            goods: [],
            entry: {},
            sorts: {},
            getTotal: getTotal
        },
        wantlist: {
            goods: [],
            entry: {},
            sorts: {},
            getTotal: getTotal
        },
        bought: {
            goods: [],
            sorts: {},
            getTotal: getTotal
        }
    };

    $scope.settings = {
        view: 'block',
        budget: 0,
        priceColors: {
            one: {},
            two: {},
            three: {},
            four: {},
            five: {}
        }
    };

    get('wishlist');
    get('wantlist');
    get('bought');
    getSettings();
})
.controller('EditGoodCtrl', function ($scope, $uibModalInstance, good, list, index) {
    $scope.good = new Good(window.JSON.parse(window.JSON.stringify(good)));
    $scope.list = list;
    $scope.index = index;

    $scope.ok = function () {
        $uibModalInstance.close({action: 'edit', good: $scope.good, slist: $scope.list, index: $scope.index});
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.delete = function () {
        $uibModalInstance.close({action: 'delete', good: $scope.good, slist: $scope.list, index: $scope.index});
    };

    $scope.transfert = function (list) {
        $uibModalInstance.close({action: 'transfert', good: $scope.good, slist: $scope.list, dlist: list, index: $scope.index});
    };
})
.controller('FindCtrl', function ($scope, $uibModalInstance, lists) {
    $scope.goods = [];
    $scope.sorts = {};
    $scope.tab = 0;
    $scope.tabData = {
        search: "",
        columnText: "brand",
        columnNumber: "price",
        type: "minus"
    };

    for (g of lists.wantlist.goods) { $scope.goods.push(g); }
    for (g of lists.wishlist.goods) { $scope.goods.push(g); }
    for (g of lists.bought.goods) { $scope.goods.push(g); }

    $scope.filt = function (v, i, a) {
        let s = $scope.tabData.search;
        if ($scope.tab == 0) {
            if (s === "" || v[$scope.tabData.columnText].indexOf(s) != -1) {
                return true;
            } else {
                return false;
            }
        } else if ($scope.tab == 1) {
            if (s === "") {
                return true;
            } else {
                let n = v[$scope.tabData.columnNumber].replace(',', '.');
                if ($scope.tabData.type === "plus") {
                    if (n > s) { return true; } else { return false; }
                } else if ($scope.tabData.type === "minus") {
                    if (n < s) { return true; } else { return false; }
                } else if ($scope.tabData.type === "equals") {
                    if (n == s) { return true; } else { return false; }
                }
            }
        }
    };

    $scope.reset = function (tab) {
        $scope.tabData.search = "";
        $scope.tab = tab;
    };

    $scope.organize = function (type) {
        let l = $scope.goods;
        if (type === "brand" || type === "model" || type === "type" || type === "price" || type === "priority") {
            if (!$scope.sorts[type]) {
                $scope.sorts[type] = true;
                l.sort(function (a, b) {
                    return a[type] > b[type];
                });
            } else {
                $scope.sorts[type] = false;
                l.sort(function (a, b) {
                    return a[type] < b[type];
                });
            }
        }
    };

    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };
})
.controller('SettingsCtrl', function ($scope, $uibModalInstance, settings) {
    $scope.settings = window.JSON.parse(window.JSON.stringify(settings));

    $scope.ok = function () {
        $uibModalInstance.close($scope.settings);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
})
.directive('eventFocus', function (focus) {
    return function (scope, elem, attr) {
        elem.on(attr.eventFocus, function () {
            focus(attr.eventFocusId);
        });

        scope.$on('$destroy', function () {
            elem.off(attr.eventFocus);
        });
    };
})
.factory('focus', function ($timeout, $window) {
    return function (id) {
        $timeout(function () {
            var element = $window.document.getElementById(id);
            if (element) { element.focus(); }
        });
    };
})
.filter('money', function () {
    return function (input) {
        let float = window.Math.round(parseFloat(input) * 100) / 100;
        return float.toFixed(2).replace('.', ',') + " €";
    };
});
