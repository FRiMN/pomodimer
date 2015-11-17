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
}

ko.applyBindings(Timer);


var timerElem = document.querySelector('#timer');
timerElem.on('tap', Timer.startTimer);