var Storage = window.localStorage;


var Task = function(name, date, tomatos) {
    // Task name
    this.name = name;
    
    // Complete tomatos
    var t = tomatos || 0;
    this.tomatos = ko.observable( 0 );
    
    // Creation date of task (unique)
    this.date = date || Date.now();
    
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

//for ( var i = 0; i < 10000; i++ ) {
//    var testTask = new Task('Тестовая задача');
//    testTask.sync();
//    //console.log(i, testTask.date)
//}

//Storage.clear();
console.info( Storage.length )
/////////////////////////////////////////////



var Timer = function() {
    // Интервал для работы, сек
    this.workTime = ko.observable(60 * 2);
    
    // Интервал для отдыха, сек
    this.relaxTime = ko.observable(60 * 1);
    
    // Интервал для длительного отдыха, сек
    this.bigRelaxTime = ko.observable(60 * 5);
    
    // Текущая задача
    this.currentTask = ko.observable({ name: 'ttt', tomatos: 5 });
    
    this.currentTime = 0;
    
    // Состояние, в котором находится таймер [stopped, working, relaxing, bigrelaxing]
    this.state = 'stopped';
    
    // Определяет тип паузы (интервала для отдыха)
    this.getPause = function() {
        var t = this.currentTask();
        var p = undefined;
        var s = 'working';
        
        if ( (t.tomatos+1) % 4 === 0 ) {
            p = this.bigRelaxTime();
            s = 'bigrelaxing';
        } else {
            p = this.relaxTime();
            s = 'relaxing';
        }
        
        return {
                time: p,
                state: s,
            };
    }.bind(this);
    
    // Список задач на день
    this.tasks = ko.observableArray([]);
    
    this.taskListBuilding = ko.observable(false);
    
    // Обновление списка задач на день
    this.tasksSync = function() {
        this.taskListBuilding(true);
        phonon.preloader('#taskListBuilding').show();
        
        var currDate = new Date();
        this.tasks.removeAll();
        try {
            for ( var i = 0; i < Storage.length; i++ ) {
                var taskKey = Storage.key(i);   // ключ == date
                var taskDate = new Date( parseInt( taskKey ) );
                if (
                        taskDate.getFullYear() === currDate.getFullYear()
                        &&
                        taskDate.getMonth() === currDate.getMonth()
                        &&
                        taskDate.getDate() === currDate.getDate()
                    ) {
                    var task_data = JSON.parse( Storage.getItem( taskKey ) );
                    //task.tomatos = ko.observable( task.tomatos );
                    var task = new Task( task_data.name, task_data.date, task_data.tomatos );
                    this.tasks.push( task );
                }
            }
        } catch(e) {}
        
        this.taskListBuilding(false);
        phonon.preloader('#taskListBuilding').hide();
    }.bind(this);
    this.tasksSync();
    
    // Добавление задачи
    this.addTask = function() {
        var taskNameField = document.querySelector('#addTaskPanel .content input');
        taskNameField.value = taskNameField.value.trim();
        if ( taskNameField.value.length > 0 ) {
            var task = new Task( taskNameField.value );
            task.sync();
        }
        taskNameField.value = '';
        phonon.panel('#addTaskPanel').close();
        this.tasksSync();
    }.bind(this);
    
    // Запуск таймера
    this.startTimer = function(task) {
        console.log('timer', task, this)
        //if ( this.status === 'working' || this.state === 'relaxing' || this.state === 'bigrelaxing' ) {
        //    clearInterval( this.timerInterval );
        //}
        
        window.plugins.insomnia.keepAwake();    // не гасить экран
        
        this.currentTask(task);
        
        this.state = 'working';
        this.timer = {
            start:   Date.now(),
            current: 0,
            full:    this.workTime(),
        }
        
        
        //this.timerInterval = setInterval(function() {
        //    if (
        //            window.currentTime === 0
        //            &&
        //            (this.state === 'relaxing' || this.state === 'bigrelaxing')
        //        ) {
        //        clearInterval( this.timerInterval );
        //        window.plugins.insomnia.allowSleepAgain();
        //    } else {
        //        window.currentTime--;
        //    }
        //    
        //    timer.textContent = Math.floor( window.currentTime / 60 ) + ':' + window.currentTime % 60;
        //}, 1000);
        this.timerCont = document.querySelector('#timer .time');
        this.updateTimer(200);
    }.bind(this);
    
    // Обновление значений таймера
    this.updateTimer = function( refresh_msecs ) {
        this.timer.current = Date.now();
        // Оставшееся время в сек.
        var t = this.timer.full - ( (this.timer.current - this.timer.start) / 1000 );
        
        var mins = Math.floor( t / 60 ); mins = (mins < 0) ? 0 : mins;
        var secs = Math.floor( t % 60 ); secs = (secs < 0) ? 0 : secs;
        this.timerCont.textContent = pad(mins.toFixed(0), 2) + ':' + pad(secs.toFixed(0), 2);
        
        if ( t <= 0 ) {
            if ( this.state === 'working' ) {
                this.timer.start = Date.now();
                this.timer.full = this.getPause().time;
                this.state = this.getPause().state;
                
                console.log(this)
                
                var task = this.currentTask();
                console.log(task)
                task.tomatos++;
                Storage.setItem( task.date, JSON.stringify(task) );
                console.log(task)
                
                setTimeout( this.updateTimer, refresh_msecs );  // запуск таймера для паузы
            }
        } else {
            setTimeout( this.updateTimer, refresh_msecs );  // продолжаем...
        }
    }.bind(this);
}
ko.applyBindings( new Timer() );





function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    
    if ( n.length < width ) {
        n = new Array(width - n.length + 1).join(z) + n;
    }
    
    return n;
}