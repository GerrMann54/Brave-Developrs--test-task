const operators = [];   // Хранит объекты операторов
let selectedOperator;   // Хранит объект оператора, которого выбрал пользователь

const phoneInput = document.querySelector('input#phone');
const moneyInput = document.querySelector('input#money');
const payButton = document.querySelector('button#pay');
const paymentStatus = document.querySelector('p#payment-status');

class Operator {

    // Объект оператора
    constructor(id, name, htmlObj) {

        this.id = id;               // ID оператора
        this.name = name;           // Имя оператора
        this.htmlObj = htmlObj;     // ссылка на объект на HTML-странице

        operators.push(this);       // Добавление оператора в список
        // Добавление на HTML-объект данного оператора функции выбора этого оператора.
        this.htmlObj.addEventListener('click', () => {
            this.selectOperator();
            // Внимание, костыль.
            // Этот обёрточный колбэк нужен для того, чтобы this определялся как Operator-объект
            // Если же поставить эту функцию без колбэка, то this будет определяться как HTML-объект
        });
    }

    selectOperator() {

        // Снятие выделения с ранее выбранного (если был выбран) оператора
        if (selectedOperator) {
            selectedOperator.htmlObj.classList.remove('selected');
        }
        
        else {

            // Разблокировка кнопки. Выполняется только один раз, при первом выборе оператора.
            const nextButton = document.querySelector('button#next');
            nextButton.classList.remove('locked');

            // Смена окна
            nextButton.addEventListener('click', () => {

                phoneInput.addEventListener('input', validatePhone);
                moneyInput.addEventListener('input', validateMoney);

                document.querySelector('.block.operator-list').classList.remove('show');
                document.querySelector('.block.payment').classList.add('show');
            });

            // Тут же активируется кнопка "назад", которая нужна, чтобы вернуться к выбору оператора
            const backButton = document.querySelector('button#back');
            backButton.addEventListener('click', () => {

                document.querySelector('.block.operator-list').classList.add('show');
                document.querySelector('.block.payment').classList.remove('show');
            });
        }

        // Установка нового выбранного оператора
        // И его выделение
        selectedOperator = this;
        selectedOperator.htmlObj.classList.add('selected');
    }

    // Создание объектов операторов и наполнение списка
    static initOperators() {

        for (let operator of document.querySelectorAll('.operator-list .list-container .item')) {
            new Operator(
                Number(operator.getAttribute('data-operator-id')),      // Передача ID из соответствующего HTML-атрибута
                operator.querySelector('p').innerHTML,                  // Имя оператора из текстового значения, отображающегося пользователю
                operator                    // Ссылка на сам HTML-объект, находящийся в списке
            );
        }
    }
}

Operator.initOperators();

// Далее код пишется в ускоренном темпе, от чего архитектура становистя менее продуманной

let phoneOldVal = '';
let moneyOldVal = '';
const statusDefault = 'Введите номер телефона и нужную сумму.';

function validatePhone() {
    
    if (phoneInput.value[0] !== '7' || isNaN(phoneInput.value)) {

        phoneInput.value = phoneOldVal;
        paymentStatus.innerHTML = 'Неверный ввод номера телефона';
        return;
    }

    if (phoneInput.value.length > 11) {

        phoneInput.value = phoneOldVal;
        paymentStatus.innerHTML = statusDefault;
        return;
    }

    phoneOldVal = phoneInput.value;
    paymentStatus.innerHTML = statusDefault;
    validateData();
}

function validateMoney() {

    if ((moneyInput.value < 1 && moneyInput.value.length > 0) || 
    moneyInput.value > 1000 || isNaN(moneyInput.value)) {

        moneyInput.value = moneyOldVal;
        paymentStatus.innerHTML = 'Неверный ввод суммы';
        return;
    }

    moneyOldVal = moneyInput.value;
    paymentStatus.innerHTML = statusDefault;
    validateData();
}

function validateData() {

    if (phoneInput.value.length === 11 && 
        moneyInput.value >= 1 && moneyInput.value <= 1000) {
        
        payButton.classList.remove('locked');
        payButton.addEventListener('click', pay);
    }

    else {

        payButton.classList.add('locked');
        payButton.removeEventListener('click', pay);
    }
}

// Эмуляция оплаты
function pay() {

    console.log('Sending data to server...')
    console.log(JSON.stringify({
        operatorId : selectedOperator.id,
        operatorName : selectedOperator.name,
        phoneNumber : phoneInput.value,
        moneySum : moneyInput.value
    }));

    // Эмуляция успешной / неудачной оплаты.
    if (Math.random() > 0.5) {

        paymentStatus.classList.add('success');
        paymentStatus.classList.remove('error');
        paymentStatus.innerHTML = 'Оплата прошла успешно. Вы можете закрыть эту страницу.';

        phoneInput.value = '';
        moneyInput.value = '';

        payButton.removeEventListener('click', pay);
        payButton.classList.add('locked');

        phoneInput.removeEventListener('input', validatePhone);
        moneyInput.removeEventListener('input', validateMoney);
    }

    else {

        paymentStatus.classList.add('error');
        paymentStatus.innerHTML = 'Ошибка сервера. Повторите попытку.';
    } 
}