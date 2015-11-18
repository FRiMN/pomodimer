var Timer = function() {
    
    // Интервал для работы, сек
    this.workTime = ko.observable(60 * 15);
    
    // Интервал для отдыха, сек
    this.relaxTime = ko.observable(60 * 5);
    
    // Текущее время (таймер), сек
    this.currentTime = ko.observable(0);
    
    // Количество законченных помидорок
    this.tomatos = ko.observable(0);
    
    // Текущая задача из списка дел на сегодня
    this.currentTask = ko.observable(null);
    
    // Список дел на сегодня
    this.tasks = ko.observableArray([
        { name: 'Дописать приложение таймера', tomatos: 0 }
    ]);
    
    
    this.startTimer = function() {
        log('timer')
        var bigTimer = document.querySelector('#timer > div .bar');
        //timerElem.off('tap');
        window.plugins.insomnia.keepAwake();    // не гасить экран
        this.currentTime( this.relaxTime() );
        var progress = 0;
        this.timerInterval = setInterval(function() {
            if ( this.currentTime() === 0 ) {
                clearInterval( this.timerInterval );
                window.plugins.insomnia.allowSleepAgain();
            } else {
                this.currentTime( this.currentTime() - 1 );
            }
            //var deg = 360 - ( 360 / this.relaxTime() * this.currentTime() );
            //bigTimer.style.transform = 'rotate(' + deg + 'deg)';
            
            
            
            progress = 1 - ( 1 / this.relaxTime() * this.currentTime() );
            
            var myCanvas = document.getElementById('timer');

            var circle = new ProgressCircle({
                canvas: myCanvas,
                minRadius: 80,
                arcWidth: 5,
            });
    
            circle.addEntry({
                fillColor: 'rgba(255, 255, 255, 0.5)',
                progressListener: function() {
                    return progress;
                },
            });
            
            circle.start(100);
            
            
            
            
            
            
        }, 1000);
    }.bind(this);
    
    
    this.addTask = function() {
        log('func')
        log(this.tasks().length)
        var taskNameField = document.querySelector('#addTaskPanel .content input');
        taskNameField.value = taskNameField.value.trim();
        if ( taskNameField.value.length > 0 ) {
            log('task')
            this.tasks.push({ name: taskNameField.value, tomatos: 0 });
        }
        taskNameField.value = '';
        phonon.panel('#addTaskPanel').close();
    }.bind(this);
    //var addTaskElem = document.querySelector('#addTaskConfirm');
    //addTaskElem.on('tap', this.addTask);
    
    return this;
};
var T = new Timer();

ko.applyBindings( T );




