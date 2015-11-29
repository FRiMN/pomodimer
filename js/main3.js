//Logger.show();


phonon.options({
    navigator: {
        defaultPage: 'timer',
        hashPrefix: '!',
        animatePages: true,
        enableBrowserBackButton: false,
        templateRootDirectory: '',
        useHash: false,
    },
    i18n: null,
})

phonon.navigator().start();


// Заглушка
window.plugins = window.plugins
                || {
                    'insomnia': {
                        keepAwake: function(){},
                        allowSleepAgain: function(){}
                    }
                };








var Timer = Backbone.Model.extend({
    defaults: {
        startTime: undefined,
        currentTime: 0,
        timeLeft: 0,
        
        workTime: 10 * 2,
        relaxTime: 10 * 1,
        bigRelaxTime: 10 * 5,
        
        currentTask: null,
        
        currentState: 'stopped',
    },
    
    start: function(state) {
        this.set({
            currentTask: _.find(tasks.models, function(item) {
                return item.id === tasks_view.active_id;
            }),
            currentState: state || 'working',
            startTime: Date.now(),
        });
        
        this.update(this);
    },
    
    update: function(self) {
        //console.log('>> update', self.attributes)
        self.set({ currentTime: Date.now() });
        
        var fullTime;
        var nextState;
        var task = self.get('currentTask');
        switch ( self.get('currentState') ) {
            case 'working':
                fullTime = self.get('workTime');
                if ( (task.get('tomatos')+1) % 4 === 0 ) {
                    nextState = 'bigrelaxing';
                } else {
                    nextState = 'relaxing';
                }
                break;
            case 'relaxing':
                fullTime = self.get('relaxTime');
                nextState = 'working';
                break;
            case 'bigrelaxing':
                fullTime = self.get('bigRelaxTime');
                nextState = 'working';
                break;
        }
        self.set({ fullTime: fullTime });
        
        self.set({ timeLeft: fullTime - ( (self.get('currentTime') - self.get('startTime')) / 1000 ) });
        
        var tl = self.get('timeLeft');
        if ( tl <= 0 ) {
            var tm = task.get('tomatos');
            if ( self.get('currentState') == 'working' ) {
                task.set({ tomatos: tm+1 });
                task.sync('update', task);
            }
            self.start(nextState);
        } else {
            _.delay(self.update, 200, self);
        }
    }
})
var timer = new Timer();



var TimerView = Backbone.View.extend({
    initialize: function() {
        this.listenTo(timer, 'change', this.render);
        this.render();
    },
    
    render: function() {
        //console.log('render', this)
        var self = this;
        
        var t = timer.get('timeLeft');
        //console.log(t)
        
        var mins = Math.floor( t / 60 ); mins = (mins < 0) ? 0 : mins;
        var secs = Math.floor( t % 60 ); secs = (secs < 0) ? 0 : secs;
        var tt = pad(mins.toFixed(0), 2) + ':' + pad(secs.toFixed(0), 2)
        
        this.$el.find('.time').text( tt );
        
        $('#mini-timer').text( tt );
        
        $('body').data( 'state', timer.get('currentState') );
    }
})
var timer_view = new TimerView({ el: $('#timer') });




var Task = Backbone.Model.extend({
    defaults: {
        name: '',
        tomatos: 0,
        date: Date.now(),
    },
    
    validate: function(attrs) {
        attrs.name = attrs.name.trim();
        if ( attrs.name.length <= 0 ) {
            alert('ddd')
            return 'Имя задачи не может быть пустым.';
        }
    },
    
    initialize: function() {
        this.bind('error', function(model, error) {
            alert(error);
        });
        //this.listenTo(this, 'change', this.sync());
    }
})


var Tasks = Backbone.Collection.extend({
    localStorage: new Backbone.LocalStorage('tasks'),
    model: Task,
})
var tasks = new Tasks();
tasks.reset( getTodayTasks() );


var TasksView = Backbone.View.extend({
    initialize: function() {
        this.render();
        this.active_id = null;
    },
    
    render: function() {
        console.log('render', this)
        var self = this;
        var preloader = '#taskListBuilding';
        
        this.$el.hide();
        phonon.preloader(preloader).show();
        
        var node_items = ''
        var attr = {active_id: this.active_id};
        _.each(tasks.models, function(item) {
            var template = _.template( $('#tasklist_template').html());
            _.extend(attr, item.attributes);
            node_items = node_items + template(attr);
        });
        this.$el.html( node_items );
        
        phonon.preloader(preloader).hide();
        this.$el.show();
        
        
        // Events
        $('#task-list a.js-startTimer').on('click', function(e) {
            var id = $(this).data('id');
            var task = _.find(tasks.models, function(item) {
                return item.id === id;
            })
            
            self.active_id = id;
            timer.start();
            self.render();
        });
    },
})
var tasks_view = new TasksView({ el: $('#task-list') });
tasks.on('change', tasks_view.render, tasks_view);









$('#addTaskConfirm').tap(function() {
    var taskNameField = document.querySelector('#addTaskPanel .content input');
    tasks.create( {name: taskNameField.value} );
    taskNameField.value = '';
    phonon.panel('#addTaskPanel').close();
});


function getTodayTasks() {
    var today_tasks = [];
    var currDate = new Date();
    var all_tasks = tasks.localStorage.findAll();
    
    today_tasks = _.filter(all_tasks, function(item) {
        var taskDate = new Date( item.date );
        
        if (
            taskDate.getFullYear() === currDate.getFullYear()
            &&
            taskDate.getMonth() === currDate.getMonth()
            &&
            taskDate.getDate() === currDate.getDate()
        ) { return true; }
    })
    
    return today_tasks;
}


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    
    if ( n.length < width ) {
        n = new Array(width - n.length + 1).join(z) + n;
    }
    
    return n;
}