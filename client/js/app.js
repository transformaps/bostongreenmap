define(['backbone', 'marionette', 'build/templates', 'js/handlebarsHelpers'], function(Backbone, Marionette, templates, helpers) {
    var app = new Marionette.Application();
    _.extend(Marionette.ItemView, {'templateHelpers': helpers});
    console.log('ItemView: ', Marionette.ItemView);

    app.addRegions({
        navRegion: '#header',
        mainRegion: '#content-area',
        footerRegion: '#footer'
    });

    // Models
    var Park = Backbone.Model.extend({
        defaults: {
            'title': ''
        }
    });

    var SearchModel = Backbone.Model.extend({
        url: function() {
            return window.location.origin + '/parks/get_neighborhoods_and_activities_list/';
        },
        parse: function(response) {
            var data = {'neighborhoods': [], 'activities': []};
            _.each(response.neighborhoods, function(neighborhood) {
                data.neighborhoods.push(neighborhood.name);
            });
            _.each(response.activities, function(activity) {
                data.activities.push(activity.name);
            });
            console.log('data: ', data);
            return data;
        }
    });

    var ParksCollection = Backbone.Collection.extend({
        model: Park,
        url: function() {
            return window.location.origin + '/parks/search?no_map=True&neighborhoods=25';
        },
        parse: function(response) {
            var parks = _.map(response.parks, function(park) {
                return new Park(park);
            });
            console.log('parks: ', parks);
            return parks;
        }
    });
    Park.Collection = ParksCollection;
    
    // Views
    var HeaderView = Marionette.ItemView.extend({
        events: {
            'click #nav-about': 'goToAbout'
        },
        template: templates['templates/headerView.hbs'],
        tagName: 'div',
        className: 'header',
        goToAbout: function(evt) {
            Backbone.history.navigate('about', {'trigger': true});
        }
    });

    var SearchView = Marionette.ItemView.extend({
        template:templates['templates/search.hbs'],
        tagName: 'div',
        className: 'finder',
        templateHelpers: {
            'jsonify': helpers.jsonify
        }
    });

    var FooterView = Marionette.ItemView.extend({
        template: templates['templates/footer.hbs'],
        tagName: 'div',
        className: 'footer'
    });

    var AboutView = Marionette.ItemView.extend({
        template: templates['templates/about.hbs'],
        tagName: 'div',
        className: 'about'
    });

    // var ParkListItemView = Marionette.ItemView.extend({
    //     template: templates['templates/parkListItem.hbs'],
    //     tagName: 'li',
    //     className: 'article'
    // });

    // var ParkListView = Marionette.CompositeView.extend({
    //     template: templates['templates/parkList.hbs'],
    //     itemView: ParkListItemView,
    //     tagName: 'ul',
    //     className: 'article-list'
    // });

    // var ParkLayout = Marionette.Layout.extend({
    //     template: templates['templates/parkLayout.hbs'],
    //     regions: {
    //         'navRegion': '#boston-green-navbar-container',
    //         'parkRegion': '#park-region'
    //     }
    // });

    app.Router = Backbone.Router.extend({
        routes: {
            '': 'home',
            'about': 'about'
        },
        home: function() {
            var searchModel = new SearchModel();
            var searchView = 
            searchModel.once('sync', function() {
                app.getRegion('mainRegion').show(new SearchView({'model': searchModel}));
            });
            searchModel.fetch();
        },
        about: function() {
            app.getRegion('mainRegion').show(new AboutView());
        }
    });

    app.addInitializer(function(options) {
        app.getRegion('navRegion').show(new HeaderView());
        app.getRegion('footerRegion').show(new FooterView());
        app.execute('setRouter', new app.Router());
        Backbone.history.start();
        // Backbone.history.navigate('', {'trigger': true});
    });

    return {
        startModule: function(done) {
            app.start({});
        }
    };
});

