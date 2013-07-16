Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        //looking for stories without parents. Also filter based on project scope
        var myFilter;
        var currentProject = this.getContext().getProject().Name;
        var parentFilter = Ext.create('Rally.data.QueryFilter', 
            {
                property: 'Parent', 
                operator: '=', 
                value: 'null'
            });
        var projectFilter = Ext.create('Rally.data.QueryFilter',
            {
                property: 'Project.Name',
                operator: '=',
                value: currentProject
            });
        myFilter = parentFilter.and(projectFilter);
        
        // if there is a timebox on the dashboard/page, make use of it
        var timeboxScope = this.getContext().getTimeboxScope();
        if( timeboxScope ) {
            console.log("Timebox query: ", timeboxScope.getQueryFilter());
            myFilter = myFilter.and(timeboxScope.getQueryFilter());
        } 
        
        Rally.data.ModelFactory.getModel({
            type: 'UserStory',
            success: function(model) {
                this.grid = this.add({
                    xtype: 'rallygrid',
                    model: model,
                    // columnCfgs allows you to specify the story fields you'd like 
                    // to see on the grid
                    columnCfgs: ['FormattedID','Name','Owner','ScheduleState'],
                    storeConfig: {
                        filters: [myFilter]
                    }
                });
            },
            scope: this
        });
    },
    
    onTimeboxScopeChange: function(newTimeboxScope) {
        this.callParent(arguments);
        console.log("Timebox Changed called");
        var parentFilter = Ext.create('Rally.data.QueryFilter', {
            property: 'Parent', 
            operator: '=', 
            value: 'null'
        });
        
        var newFilter = parentFilter.and(newTimeboxScope.getQueryFilter());
        var store = this.grid.getStore();
        store.clearFilter(true);
        store.filter(newFilter);
    }
});