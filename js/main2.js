var Storage = window.localStorage;


var Task = function(name) {
    // Task name
    this.name = name;
    
    // Complete tomatos
    this.tomatos = 0;
    
    // Creation date of task (unique)
    this.date = Date.now();
    
    this.toString = function() {
        return JSON.stringify(this);
    }
    
    this.sync = function() {
        Storage.setItem( this.date, this );
    }
}

/////////////////////////////////////////////
// TEST
//var testTask = new Task('Тестовая задача');
//console.log(testTask)
////Storage.setItem( testTask.date, testTask );
//testTask.sync()
//
//testTask.tomatos = 4;
//
//var tt = JSON.parse( Storage.getItem( testTask.date ) );
//console.log(tt, tt.name, tt.tomatos, tt.date)

//Storage.setItem( testTask.date, testTask );
//
/////////////////////////////////////////////



var Timer = function() {
    // Интервал для работы, сек
    this.workTime = ko.observable(60 * 25);
    
    // Интервал для отдыха, сек
    this.relaxTime = ko.observable(60 * 5);
    
    // Интервал для длительного отдыха, сек
    this.bigRelaxTime = ko.observable(60 * 20);
    
    // Состояние, в котором находится таймер [stopped, working, relaxing, bigrelaxing]
    this.state = 'stopped';
    
    this.tasks = ko.observableArray([]);
    
    this.tasksSync = function() {
        var currDate = new Date();
        this.tasks.removeAll();
        for ( var i = 0; i < Storage.length; i++ ) {
            var taskDate = new Date( parseInt(Storage.key(i)) );
            if (
                    taskDate.getFullYear() === currDate.getFullYear()
                    &&
                    taskDate.getMonth() === currDate.getMonth()
                    &&
                    taskDate.getDate() === currDate.getDate()
                ) {
                this.tasks.push( JSON.parse( Storage.getItem( Storage.key(i) ) ) );
            }
        }
    }.bind(this);
    this.tasksSync();
    
    this.addTask = function() {
        var taskNameField = document.querySelector('#addTaskPanel .content input');
        taskNameField.value = taskNameField.value.trim();
        if ( taskNameField.value.length > 0 ) {
            var task = new Task( taskNameField.value );
            Storage.setItem( task.date, task );
        }
        taskNameField.value = '';
        phonon.panel('#addTaskPanel').close();
        this.tasksSync();
    }.bind(this);
}
ko.applyBindings( new Timer() );
