var Timer = {
    
    // Интервал для работы, сек
    workTime: ko.observable(60 * 15),
    
    // Интервал для отдыха, сек
    relaxTime: ko.observable(60 * 5),
    
    // Текущее время (таймер), сек
    currentTime: ko.observable(0),
    
    // Количество законченных помидорок
    tomatos: ko.observable(0),
    
    // Текущая задача из списка дел на сегодня
    currentTask: ko.observable(null),
    
    // Список дел на сегодня
    tasks: ko.observableArray([
        { name: 'Дописать приложение таймера', tomatos: 0 }
    ]),
    
    startTimer: function() {
        console.log(this)
        this.off('tap');
        window.plugins.insomnia.keepAwake();    // не гасить экран
        window.timerInterval = setInterval(function() {
            if ( currentTime === 0 ) {
                //currentTime = 0;
                clearInterval( window.timerInterval );
                window.plugins.insomnia.allowSleepAgain();
                //seconds.setText( '00:00' );
            } else {
                currentTime = currentTime - 1;
            }
            seconds.animate(1 - (currentTime / fullTime));
        }, 1000);
    },
    
    addTask: function() {
        log('func')
        log(Timer.tasks().length)
        //var prompt = phonon.prompt('Введите название задачи', 'Добавление задачи', true, 'Добавить', 'Отменить');
        //log('promt')
        //prompt.on('confirm', function(inputValue) {
        //    log('on')
        //    inputValue = inputValue.trim();
        //    if ( inputValue.length > 0 ) {
        //        log('task')
        //        Timer.tasks.push({ name: inputValue, tomatos: 0 });
        //    }
        //});
        //prompt.on('cancel', function() {} );
        var taskNameField = document.querySelector('#addTaskPanel .content input');
        taskNameField.value = taskNameField.value.trim();
        if ( taskNameField.value.length > 0 ) {
            log('task')
            Timer.tasks.push({ name: taskNameField.value, tomatos: 0 });
            //Timer.tasks.valueHasMutated();
            var data = Timer.tasks().slice(0);
            Timer.tasks([]);
            Timer.tasks(data);
        }
        taskNameField.value = '';
        phonon.panel('#addTaskPanel').close();
    }
}

ko.applyBindings(Timer);


var timerElem = document.querySelector('#timer');
timerElem.on('tap', Timer.startTimer);

var addTaskElem = document.querySelector('#addTaskConfirm');
addTaskElem.on('tap', Timer.addTask);