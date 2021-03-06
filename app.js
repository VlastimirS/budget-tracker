

// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }


    // calculate percentage
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }        
    };

    // returns it
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1   
    };

    return {
        addItem: function(type, des, val) {
            var newItem;

            // Create new ID 
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            

            // new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //push it to data structure
            data.allItems[type].push(newItem);

            // return to new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            // id = 3
            var  ids = data.allItems[type].map(function (current) {
                return current.id;
            }); 

            index = ids.indexOf(id);

            if (index !== -1 ) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function() {

            // calculate total income and expenses

            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses

            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of the income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
           
        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });

        },

        getPercentage: function() {

            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    };
})();


// UI CONTROLLER
var UIController = (function() {

    var DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3) {
           int = int.substr(0, int.length - 3) + ',' +int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;


    }; 

    var fields = document.querySelectorAll(DOMstring.expensesPercLabel);
    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++ ) {
            callback(list[i], i);
        };
    };


    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstring.inputType).value,
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML with placeholder text
            if (type === 'inc') {
                element = DOMstring.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            } else if (type === 'exp') {
                element = DOMstring.expensesContainer;
                html ='<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>'
            }
                   
            // Replace the placeholder text with some actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber (obj.value, type));

            // Insert HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstring.inputDescription + ' , ' + DOMstring.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0 ) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percenateges) {

            nodeListForEach(fields, function(current, index) {
                if (percenateges[index] > 0) {
                    current.textContent = percenateges[index] + '%';
                }else {
                    current.textContent = '---';
                }             
            });

        },

        displayMonth: function(){
            var now, year, month, months;
            
            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();

            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstring.inputType + ',' +
                DOMstring.inputDescription + ',' +
                DOMstring.inputValue 

            );

                nodeListForEach(fields, function(cur) {
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMstring.inputBtn).classList.toggle('red');
        },

        getDOMstring : function() {
            return DOMstring;
        }
    }
})();



// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstring();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        } 
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    }

  
    var updateBudget = function() {
        // Calculate the budget

        budgetCtrl.calculateBudget();
        // Return the budget

        var budget = budgetCtrl.getBudget();

        // Display budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function() {
        // Calculate percentages
        budgetCtrl.calculatePercentages();
        // read percentages from the budget controler
        var percentages = budgetCtrl.getPercentage();
        // update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function() {
        var input,newItem;

        // Get the field input data
        var input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
             // Add item to the budget controller
        var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // Add new item to the user interface

        UICtrl.addListItem(newItem, input.type);

        // For clear the fields

        UICtrl.clearFields();

        // Calculate and update budget
        updateBudget();

        // calculate and update percentages
        updatePercentages();

        }     
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {

            //inc-1 
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete the item from the data structure 
            budgetCtrl.deleteItem(type, ID);   
            // delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // update and show the new budget
            updateBudget();    

            // calculate and update percenateges
            updatePercentages();
        }

    };

    return {
        init: function() {
            console.log('App has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }


})(budgetController, UIController);


controller.init();