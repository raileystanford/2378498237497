// Tabs
let counters = document.querySelector('.counters');
let calc = document.querySelector('#calc2');
let height;

counters.addEventListener('click', (event) => {
    if (event.target.dataset.info === 'open') {
        event.target.classList.toggle('open');
        event.target.firstElementChild.classList.toggle('open');
        event.target.firstElementChild.children[0].classList.toggle('open');
        event.target.children[1].classList.toggle('open');
    }
    if (!calc.classList.contains('open')) {
        calc.style.height = '';
    } else {
        calc.style.height = height + 197 + 'px';
    }
})

// Caluclator
let submitButton = document.querySelector('.o-p-calculator__submit');
let resetButton = document.querySelector('.o-p-calculator__reset');
let enterPrice = document.querySelector('#input1');
let enterSum = document.querySelector('#input2');
let shoulder = document.querySelector('#input3');
let stopPercent = document.querySelector('#input4');
let profitMult = document.querySelector('#input5');
let depositBalance = document.querySelector('#input6');
let takerComission = 0.0005; // 0.05% комисия тейкера
let direction;

let resTable = document.querySelector('.o-p-calculator__result');
let inputArea = document.querySelector('.o-p-calculator__numbers');
let numberInputs = inputArea.querySelectorAll('input');
let changeOptions = document.querySelector('#check1');
const disabled = Array.from(numberInputs).filter((item) => item.hasAttribute('disabled'));

submitButton.addEventListener('click', (event) => {

    direction = document.querySelector('#check2').checked ? 'long' : 'short';

    if (Array.from(numberInputs).every((item) => item.value ? true : false)) {

        Array.from(numberInputs).forEach((item) => item.classList.remove('error'));

        resTable.rows[1].cells[0].textContent = `${enterPrice.value}`; // цена входа в таблице
        resTable.rows[1].cells[1].textContent = `${direction === 'long' ? 'Лонг' : 'Шорт'}`; // направление в таблице
        resTable.rows[1].cells[2].textContent = `${enterSum.value + ' $'}`; // сума входа в таблице
        resTable.rows[1].cells[3].textContent = `${shoulder.value + 'x'}`; // плечо в таблице
        resTable.rows[1].cells[4].textContent = `${getProfitPrice(enterPrice, enterSum, shoulder, stopPercent, direction, profitMult)}`; // цена профит в таблице
        resTable.rows[1].cells[4].style.backgroundColor = 'rgba(50, 205, 50, 0.4)' // цена профит в таблице подсветка
        resTable.rows[1].cells[5].textContent = `${getStopPrice(enterPrice, enterSum, shoulder, stopPercent, direction)}`; // цена стоп в таблице
        resTable.rows[1].cells[5].style.backgroundColor = 'rgba(255, 0, 0, 0.4)' // цена стоп в таблице подсветка
        resTable.rows[1].cells[6].textContent = `${getProfitSum(enterPrice, enterSum, shoulder, direction) + ' $'}`; // сума профита в таблице
        resTable.rows[1].cells[7].textContent = `${getLosSum(enterPrice, enterSum, shoulder, direction) + ' $'}`; // сума лоса в таблице
        resTable.rows[1].cells[8].textContent = `${(getComission(enterSum, shoulder, takerComission) * 2) + ' $'}`; // общая комисия в таблице
        resTable.rows[1].cells[9].textContent = `${getNewBalance(depositBalance)}`; // баланс депозита в таблице
    
    } else {

        Array.from(numberInputs).filter((item) => item.value === '').forEach((item) => item.classList.add('error'))

    }
})

resetButton.addEventListener('click', (event) => {

    Array.from(numberInputs).forEach((item) => { 
        if (!item.hasAttribute('disabled')) {
            item.value = '';
            item.classList.remove('error');
        }
    });
    document.querySelector('#check2').checked = true;

})

inputArea.addEventListener('click', (event) => {

    if (event.target.tagName === 'INPUT') {
        event.target.classList.remove('error');
    }

})

changeOptions.addEventListener('click', () => {

    disabled.forEach((item) => {
        if (item.hasAttribute('disabled')) {
            item.removeAttribute('disabled')
        } else {
            item.setAttribute('disabled', '');
        }
    })

})

function getCountOfSymbolsAfterPoint(enterPrice) { //Расчет количества знаков после запятой

    let box = enterPrice.value.split('');
    let count = box.indexOf('.', 0);
    if (count == -1) {
        return 0;
    } else {
        return box.length - (count + 1);
    }  

}

function getStopPrice(enterPrice, enterSum, shoulder, stopPercent, direction) { //Расчет цены стопа

    stopPercent = +stopPercent.value / 100;
    let stop = +enterSum.value * stopPercent;
    let numbersAfterPoint = getCountOfSymbolsAfterPoint(enterPrice);
    let result;

    if (direction === 'long') {
        result = +enterPrice.value - (((stop * +enterPrice.value) / +enterSum.value) / +shoulder.value);
    } else {
        result = +enterPrice.value + (((stop * +enterPrice.value) / +enterSum.value) / +shoulder.value);
    }

    if (numbersAfterPoint > 0) {
        return +result.toFixed(numbersAfterPoint);
    } else {
        return result;
    }

}

function getProfitPrice(enterPrice, enterSum, shoulder, stopPercent, direction, profitMult) { //Расчет цены профита

    stopPercent = +stopPercent.value / 100;
    let stop = +enterSum.value * stopPercent;
    let numbersAfterPoint = getCountOfSymbolsAfterPoint(enterPrice);
    let result;

    if (direction === 'long') {
        result = +enterPrice.value + ((((stop * +enterPrice.value) / +enterSum.value) / +shoulder.value) * +profitMult.value);
    } else {
        result = +enterPrice.value - ((((stop * +enterPrice.value) / +enterSum.value) / +shoulder.value) * +profitMult.value);
    }
    
    if (numbersAfterPoint > 0) {
        return +result.toFixed(numbersAfterPoint);
    } else {
        return result;
    }

}

function getProfitSum(enterPrice, enterSum, shoulder, direction) { //Расчет прибыли

    let profitPrice = getProfitPrice(enterPrice, enterSum, shoulder, stopPercent, direction, profitMult);
    let result;
    if (direction === 'long') {
        result = ((+enterSum.value * +shoulder.value * profitPrice) / +enterPrice.value) - (+enterSum.value * +shoulder.value);
    } else {
        result = (+enterSum.value * +shoulder.value) - ((+enterSum.value * +shoulder.value * profitPrice) / +enterPrice.value);
    }
    
    return +result.toFixed(2);

}

function getLosSum(enterPrice, enterSum, shoulder, direction) { //Расчет убытка

    let stopPrice = getStopPrice(enterPrice, enterSum, shoulder, stopPercent, direction, profitMult);
    let result;
    if (direction === 'long') {
        result = ((+enterSum.value * +shoulder.value * stopPrice) / +enterPrice.value) - (+enterSum.value * +shoulder.value);
    } else {
        result = (+enterSum.value * +shoulder.value) - ((+enterSum.value * +shoulder.value * stopPrice) / +enterPrice.value);
    }
    
    return +result.toFixed(2);

}

function getComission(enterSum, shoulder, takerComission) { //Расчет комисии

    let result = (+enterSum.value * +shoulder.value) * takerComission;
    return +result.toFixed(2);

}

function getNewBalance(depositBalance) { //Расчет нового баланса депозита 

    let profit = getProfitSum(enterPrice, enterSum, shoulder, direction);
    let los = getLosSum(enterPrice, enterSum, shoulder, direction);
    let comission = getComission(enterSum, shoulder, takerComission);
    let profitResult = (+depositBalance.value + profit) - (comission * 2);
    let losResult = (+depositBalance.value - -los) - (comission * 2);
    return `${profitResult.toFixed(2) + ' $'} / ${losResult.toFixed(2) + ' $'}`;

}

// Расчет количества ставок
let sec2 = document.querySelector('#sec2');
let table1 = calc.querySelector('#table1');
let submit1 = document.querySelector('#sub1');
let reset2 = document.querySelector('#res1');

submit1.addEventListener('click', () => {
    
    let startSum = document.querySelector('#input11').value;
    let balance = document.querySelector('#input31').value;
    let mult = document.querySelector('#input21').value;
    let shoulder2 = document.querySelector('#input12').value;
    let stopPercent2 = document.querySelector('#input211').value;
    let profitMult2 = document.querySelector('#input2111').value;
    
    if (Array.from(calc.querySelectorAll('input')).every(item => item.value !== '')) {
        getBetsCount(+startSum, +balance, +mult, +stopPercent2, +shoulder2, +profitMult2);
    }

});

reset2.addEventListener('click', () => {

    let numbers = calc.querySelectorAll('input');
    Array.from(numbers).forEach(item => item.value = '');
    Array.from(table1.rows).filter((item) => item != table1.rows[0]).forEach(item => item.remove())
    let row = document.createElement('tr');
    table1.firstElementChild.append(row);
    let cellCount = table1.firstElementChild.firstElementChild.cells.length;
        
    for (let i = 1; i <= cellCount; i++) {
        let cell = document.createElement('td');
        cell.textContent = '--';
        row.append(cell);
    }

})

function getBetsCount(startSum, balance, increase, stop, shoulder, mult) {

    let base = table1.firstElementChild;
    let cellCount = base.firstElementChild.cells.length;
    let comission = ((startSum * shoulder) * takerComission) * 2;
    base.lastElementChild.remove();

    for (let i = 1; startSum < balance; i++) {

        let row = document.createElement('tr');
        base.append(row);
        
        for (let i = 1; i <= cellCount; i++) {
            let cell = document.createElement('td');
            row.append(cell);
        }

        if (i == 1) {
            base.rows[i].cells[0].textContent = i;
            base.rows[i].cells[1].textContent = `${startSum.toFixed(2) + ' $'}`;
            base.rows[i].cells[2].textContent = shoulder + ' x';
            base.rows[i].cells[3].textContent = 0 + ' %';
            base.rows[i].cells[4].textContent = startSum * shoulder + ' $';
            base.rows[i].cells[5].textContent = comission.toFixed(2) + ' $';
            base.rows[i].cells[6].textContent = `${((startSum * (stop / 100)) + comission).toFixed(2) + ' $'} / ${(((startSum * (stop / 100)) * mult) - comission).toFixed(2) + ' $'}`;
            base.rows[i].cells[7].textContent = `${((balance - (startSum * (stop / 100))) - comission).toFixed(2) + ' $'} / ${((((startSum * (stop / 100)) * mult) + balance) - comission).toFixed(2) + ' $'}`;
        
            balance = (balance - (startSum * (stop / 100))) - comission;
        } else {
            startSum = (startSum * (increase / 100)) + startSum;
            comission = ((startSum * shoulder) * takerComission) * 2;

            base.rows[i].cells[0].textContent = i;
            base.rows[i].cells[1].textContent = startSum.toFixed(2) + ' $';
            base.rows[i].cells[2].textContent = shoulder + ' x';
            base.rows[i].cells[3].textContent = increase + ' %';
            base.rows[i].cells[4].textContent = (startSum * shoulder).toFixed(2) + ' $';
            base.rows[i].cells[5].textContent = comission.toFixed(2) + ' $';
            base.rows[i].cells[6].textContent = `${((startSum * (stop / 100)) + comission).toFixed(2) + ' $'} / ${((startSum * (stop / 100) * mult) - comission).toFixed(2) + ' $'}`;
            base.rows[i].cells[7].textContent = `${((balance - (startSum * (stop / 100))) - comission).toFixed(2) + ' $'} / ${(balance + (((startSum * (stop / 100)) * mult)) - comission).toFixed(2) + ' $'}`;

            balance = (balance - (startSum * (stop / 100))) - comission;
        }

    }

    Array.from(table1.rows).filter(item => item.cells[0].textContent == '').forEach(item => item.remove())
    height = table1.offsetHeight;
    calc.style.height = height + 197 + 'px';

}