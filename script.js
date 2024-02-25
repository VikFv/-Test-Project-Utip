//Текущая страница таблицы для системы пагинации
var curPage = 0;
//Количество строк для отрисовки таблицы
var step = 10;
//Максимальное количество записей всей таблицы
var maxPageCount = 0;
//Выбранная строка
var curRow;
//Объект с данными всех записей таблицы
var localData = JSON.parse(localStorage.getItem("tableContent"));
//Объект с данными о высоте каждой строки
var localTrValuesHeight = [];
//Объект с данными о ширине каждой колонки
var localThValuesWidth = [];
//Переменная для системы перемещения строки
var tableRow;

if (localData == null)
    localData = [];

//Элемент кнопки очистки таблицы и всех данных
let buttonClear = document.getElementsByClassName("button-clear")[0];
//Элемент контейнер системы пагинации
let pageSelector = document.getElementsByClassName("page-selector")[0];
//Элемент контейнер количества страниц для системы пагинации
let pageButtonsContainer = document.getElementsByClassName("page-buttons-container")[0];
//Элемент кнопки шага "назад" системы пагинации
let selectBack = document.getElementsByClassName("select-back")[0];
//Элемент кнопки шага "вперед" системы пагинации
let selectNext = document.getElementsByClassName("select-next")[0];
//Элемент текста остутсивя данных ьыблицы для отрисовки (заглушка)
let stub = document.getElementsByClassName("stub")[0];
//Элемент указателя процесса загрузки в процессе выполниния скриптов 
let preloader = document.getElementById("preloader");

//Объект наименований для стобцов
var jsonValueNames = {
    0: "name",
    1: "birth_year",
    2: "gender",
    3: "height",
    4: "mass"
};

//Объект дефолтных значений высоты каждой строки 
var trValueHeight = {
    0: "auto",
    1: "auto",
    2: "auto",
    3: "auto",
    4: "auto",
    5: "auto",
    6: "auto",
    7: "auto",
    8: "auto",
    9: "auto"
};

//Значение высоты tHead
var localTHeadValue = "auto";

//Объект дефолтных значений ширины каждого столбца 
var thValueWidth = {
    0: "auto",
    1: "auto",
    2: "auto",
    3: "auto",
    4: "auto"
};


//Переменные для сортированного обьекта данных таблицы
var sortLocalData = [];
var headColumnName = null;
var preHeadColumn = null;

var headColumnsTable = table.querySelectorAll("th");

[].forEach.call(headColumnsTable, function (headColumn) {
    headColumn.style.transition = ".3s ease-in-out background";

    headColumn.addEventListener("click", function () {

        let headColumnNameText = this.innerText.toLowerCase().replace(/\s/gi, "_");

        if (headColumnName == headColumnNameText) {
            clearSort();
            return;
        }

        headColumnName = headColumnNameText;

        sortTableData(headColumnName);

        if (preHeadColumn != null)
            preHeadColumn.style.background = "royalblue";

        this.style.background = "#0034cf";

        preHeadColumn = this;
    })
});

//Функция сортировки данных
function sortTableData(headColumnName) {
    sortLocalData = [];

    if (headColumnName == "height" || headColumnName == "mass") {
        sortLocalData = structuredClone(localData);
        sortLocalData = sortLocalData.sort((field1, field2) => parseInt(field1[headColumnName]) > parseInt(field2[headColumnName]) ? 1 : -1);
    } else {
        sortLocalData = structuredClone(localData);
        sortLocalData = sortLocalData.sort((field1, field2) => field1[headColumnName] > field2[headColumnName] ? 1 : -1);
    }

    checkData();
}

//Функция сброса сортировки данных
function clearSort() {

    sortLocalData = [];
    headColumnName = null;
    preHeadColumn = null;

    [].forEach.call(headColumnsTable, function (headColumn) {
        headColumn.style.background = "royalblue";
    });

    checkData();
}

var tableBody = table.children[1];
var buttonDel = document.getElementsByClassName("button-del")[0];

buttonDel.addEventListener("click", function () {
    deleteRow();
});

//Функция перерисовки ширины столбцов
function redrawColumnWidth() {
    let columns = table.querySelectorAll("th");

    table.children[0].children[0].style.height = localTHeadValue;

    [].forEach.call(columns, function (column) {
        column.style.width = localThValuesWidth[column.dataset.id];
    });
}

//Функция проверки наличия данных для отрисовки
function checkData() {

    if (JSON.parse(localStorage.getItem("localTrValuesHeight")) == null) {
        localStorage.setItem("localTrValuesHeight", JSON.stringify(trValueHeight));
        localTrValuesHeight = JSON.parse(localStorage.getItem("localTrValuesHeight"));
    } else {
        localTrValuesHeight = JSON.parse(localStorage.getItem("localTrValuesHeight"));
    }

    if (JSON.parse(localStorage.getItem("localThValuesWidth")) == null) {
        localStorage.setItem("localThValuesWidth", JSON.stringify(thValueWidth));
        localThValuesWidth = JSON.parse(localStorage.getItem("localThValuesWidth"));
    } else {
        localThValuesWidth = JSON.parse(localStorage.getItem("localThValuesWidth"));
    }

    if (localStorage.getItem("localTHeadValue") == null) {
        localStorage.setItem("localTHeadValue", localTHeadValue);
        localTHeadValue = localStorage.getItem("localTHeadValue");
    } else {
        localTHeadValue = localStorage.getItem("localTHeadValue");
    }

    redrawColumnWidth();

    if (localData.length == 0) {
        stub.style.display = "flex";
        table.style.display = "none";
        buttonClear.style.display = "none";
        preloader.classList.add("preloader-hidden");
    } else {
        stub.style.display = "none";
        table.style.display = "block";
        buttonClear.style.display = "flex";

        if (sortLocalData != [] && headColumnName != null)
            redrawTable(sortLocalData);
        else
            redrawTable(localData);
    }
}

checkData();

let buttonSend = document.getElementsByClassName("button-send")[0];

//Отправка запроса на сервер
buttonSend.addEventListener("click", function () {

    preloader.setAttribute("class", "")

    fetch("https://swapi.dev/api/people/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            localData.push(data.results)
            localData = localData.flat(1);
            localStorage.setItem("tableContent", JSON.stringify(localData));
            localData = JSON.parse(localStorage.getItem("tableContent"));

            if (sortLocalData != [] && headColumnName != null)
                sortTableData(headColumnName);
            else
                checkData();
        });
});

//Функция перерисовки таблици
function redrawTable(data) {

    tableBody.innerHTML = "";
    maxPageCount = Math.ceil(data.length / step);

    let trCount = step * curPage;
    let trCountMax = (step * curPage) + step;
    let tableContentLength = data.length;

    if (trCountMax >= tableContentLength)
        trCountMax = tableContentLength;

    for (let i = trCount; i < trCountMax; i++) {

        let trTable = document.createElement("tr");
        trTable.dataset.id = i;
        trTable.dataset.numberRow = i - trCount;
        tableBody.appendChild(trTable);
        trTable.setAttribute("onclick", "selectRow(this)");
        trTable.style.height = localTrValuesHeight[trTable.dataset.numberRow];

        trTable.setAttribute("draggable", true);
        trTable.setAttribute("ondragstart", "start();");
        trTable.setAttribute("ondragover", "dragover();");
        trTable.setAttribute("ondragend", "dragend();");

        for (let j = 0; j < 5; j++) {
            let tdTable = document.createElement("td");
            trTable.appendChild(tdTable);

            tdTable.innerHTML = data[i][jsonValueNames[j]];
        }
    }

    buttonClear.style.display = "flex";
    buttonDel.style.display = "none";

    createResizableTable(document.getElementById("table"));

    pageSelectorDraw(data);
}

//Функция отрисовки системы пагинации
function pageSelectorDraw(data) {
    if (data.length <= 10) {
        preloader.classList.add("preloader-hidden");
        return;
    }

    pageButtonsContainer.innerHTML = "";

    pageSelector.style.display = "flex";

    let buttonsCount = Math.ceil(data.length / 10);

    for (let i = 0; i < buttonsCount; i++) {
        let buttonSelectPage = document.createElement("div");
        buttonSelectPage.setAttribute("class", "button-select-page")
        buttonSelectPage.setAttribute("id", "button-select-page_" + i)
        buttonSelectPage.dataset.id = i;
        pageButtonsContainer.appendChild(buttonSelectPage);
        buttonSelectPage.innerHTML = i + 1;

        if (i == curPage)
            buttonSelectPage.style.background = "royalblue";

        buttonSelectPage.addEventListener("click", function () {
            let number = parseInt(this.dataset.id);
            if (curPage == number)
                return;

            buttonDel.style.display = "none";
            curPage = number;
            redrawTable(data);
        })
    }

    if (curPage == maxPageCount - 1)
        selectNext.style.display = "none";
    else
        selectNext.style.display = "flex";

    if (curPage == 0)
        selectBack.style.display = "none";
    else
        selectBack.style.display = "flex";

    preloader.classList.add("preloader-hidden");
}

selectBack.addEventListener("click", function () {
    selectPageButtonArrow("back");
})

selectNext.addEventListener("click", function () {
    selectPageButtonArrow("next");
})

//Функция для системы пагинации (клик на кнопку предедущей страницы или следующей)
function selectPageButtonArrow(mode) {

    buttonDel.style.display = "none";

    if (mode == "next") {

        curPage = curPage + 1;

        if (sortLocalData != [] && headColumnName != null)
            redrawTable(sortLocalData);
        else
            redrawTable(localData);

        selectBack.style.display = "flex";

        if (curPage === maxPageCount - 1)
            selectNext.style.display = "none";

    } else {

        curPage = curPage - 1;

        if (sortLocalData != [] && headColumnName != null)
            redrawTable(sortLocalData);
        else
            redrawTable(localData);

        selectNext.style.display = "flex";

        if (curPage === 0)
            selectBack.style.display = "none";
    }
}

//Переменная для функции selectRow()
var preElem = null;

//Функция выбора строки
function selectRow(elem) {

    if (preElem != null && preElem == elem)
        return;

    if (preElem != null)
        preElem.style.background = "transparent";

    elem.style.background = "#303030";
    preElem = elem;

    buttonDel.style.display = "flex";

    curRow = parseInt(elem.dataset.id);
}

//Функция очистки таблицы и всех данных
function clearTable() {
    tableBody.innerHTML = "";
    localData = [];
    localStorage.clear();
    resizerSelectors();
    buttonClear.style.display = "none";
    buttonDel.style.display = "none";
    pageSelector.style.display = "none";
    pageButtonsContainer.innerHTML = "";
    selectBack.style.display = "none";
    curRow = null;
    localTrValuesHeight = [];

    localTHeadValue = "auto";

    sortLocalData = [];
    headColumnName = null;
    preHeadColumn = null;

    [].forEach.call(headColumnsTable, function (headColumn) {
        headColumn.style.background = "royalblue";
    });

    checkData();
}

buttonClear.addEventListener("click", function () {
    clearTable();
});

//Общая функция для подготовки системы ресайза колонок и строк
function createResizableTable(table) {

    let columns = table.querySelectorAll("th");

    let tbody = table.querySelectorAll("tbody")[0];
    let thead = table.querySelectorAll("thead")[0];

    [].forEach.call(columns, function (column) {
        if (!column.children[0]) {
            let resizerColumns = document.createElement("div");
            resizerColumns.classList.add("resizerColumn");
            resizerColumns.style.height = tbody.getBoundingClientRect().height + thead.getBoundingClientRect().height + "px";
            column.appendChild(resizerColumns);
            createResizableColumn(column, resizerColumns);
        } else
            resizerSelectors();
    });

    let rows = table.querySelectorAll("tr");
    [].forEach.call(rows, function (row) {
        if (row.lastChild.tagName != "DIV") {
            let resizerRows = document.createElement("div");
            resizerRows.classList.add("resizerRow");
            resizerRows.style.width = row.getBoundingClientRect().width + "px";
            row.appendChild(resizerRows);
            createResizableRows(row, resizerRows);
        } else {
            resizerSelectors();
        }
    });

};

//Функция системы еремещения строки
function start() {
    tableRow = event.target;
}
//Функция системы еремещения строки
function dragover() {

    var e = event;
    e.preventDefault();

    let children = Array.from(e.target.parentNode.parentNode.children);

    if (children.indexOf(e.target.parentNode) > children.indexOf(tableRow))
        e.target.parentNode.after(tableRow);
    else
        e.target.parentNode.before(tableRow);
}

//Функция системы еремещения строки
function dragend() {
    let newPositionNumberTable;
    let dataPositionNumberTable = parseInt(tableRow.dataset.numberRow);
    let positionInLocalData = parseInt(tableRow.dataset.id);
    let tableRowData = localData[positionInLocalData];

    function getNum(row) {
        var i = 0;
        while (row = row.previousSibling) {
            row.nodeType == 1 && i++;
        }
        newPositionNumberTable = i;

        if (newPositionNumberTable == dataPositionNumberTable)
            return;

        let difPosition = newPositionNumberTable - dataPositionNumberTable;

        localData.splice(positionInLocalData, 1)

        localData.splice(positionInLocalData + difPosition, 0, tableRowData)

        localStorage.setItem("tableContent", JSON.stringify(localData));
        localData = JSON.parse(localStorage.getItem("tableContent"));
    }

    getNum(tableRow);
}

//Функция отрисовки элементов для системы ресайза колонок
function createResizableColumn(col, resizerColumn) {
    let x = 0;
    let w = 0;

    let mouseDownHandler = function (e) {

        col.setAttribute("draggable", false);

        x = e.clientX;

        let stylesColumn = window.getComputedStyle(col);
        w = parseInt(stylesColumn.width, 10);

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);

        resizerColumn.classList.add("resizingColumn");
    };

    let mouseMoveHandler = function (e) {
        let dx = e.clientX - x;
        col.style.width = (w + dx) + "px";

        localThValuesWidth[col.dataset.id] = col.style.width;

        localStorage.setItem("localThValuesWidth", JSON.stringify(localThValuesWidth));
        localThValuesWidth = JSON.parse(localStorage.getItem("localThValuesWidth"));

        resizerSelectors()
    };

    let mouseUpHandler = function () {
        resizerColumn.classList.remove("resizingColumn");
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        resizerSelectors()
    };

    resizerColumn.addEventListener("mousedown", mouseDownHandler);
};

//Функция отрисовки элементов для системы ресайза строк
function createResizableRows(row, resizerRow) {
    let y = 0;
    let h = 0;

    let mouseDownHandlerRow = function (e) {

        row.setAttribute("draggable", false);

        y = e.clientY;

        let stylesRow = window.getComputedStyle(row);
        h = parseInt(stylesRow.height, 10);

        document.addEventListener("mousemove", mouseMoveHandlerRow);
        document.addEventListener("mouseup", mouseUpHandlerRow);

        resizerRow.classList.add("resizingRow");
    };

    let mouseMoveHandlerRow = function (e) {
        let dy = e.clientY - y;
        row.style.height = (h + dy) + "px";

        if (row.parentNode.tagName == "THEAD") {
            localTHeadValue = row.style.height;
            localStorage.setItem("localTHeadValue", localTHeadValue);
            localTHeadValue = localStorage.getItem("localTHeadValue");
        } else {
            localTrValuesHeight[row.dataset.numberRow] = row.style.height;
            localStorage.setItem("localTrValuesHeight", JSON.stringify(localTrValuesHeight));
            localTrValuesHeight = JSON.parse(localStorage.getItem("localTrValuesHeight"));
        }

        resizerSelectors()
    };

    let mouseUpHandlerRow = function () {
        mousdownRowMode = null;
        resizerRow.classList.remove("resizingRow");
        document.removeEventListener("mousemove", mouseMoveHandlerRow);
        document.removeEventListener("mouseup", mouseUpHandlerRow);
        resizerSelectors();

        row.setAttribute("draggable", true);
    };

    resizerRow.addEventListener("mousedown", mouseDownHandlerRow);
};

createResizableTable(document.getElementById("table"));

//Функция для перерисовки элементов системы ресайза колонок и строк
function resizerSelectors() {
    let table = document.getElementById("table");
    let tbody = table.querySelectorAll("tbody")[0];
    let thead = table.querySelectorAll("thead")[0];

    let columnsSelector = table.querySelectorAll(".resizerColumn");
    [].forEach.call(columnsSelector, function (column) {
        column.style.height = tbody.getBoundingClientRect().height + thead.getBoundingClientRect().height + "px";
    });

    let rowsSelector = table.querySelectorAll(".resizerRow");
    [].forEach.call(rowsSelector, function (row) {
        row.style.width = "100%";
    });
}

//Функция удаления строки
function deleteRow() {
    localData.splice(curRow, 1);
    redrawTable(localData);
    curRow = null;
    buttonDel.style.display = "none";

    localStorage.setItem("tableContent", JSON.stringify(localData));
    localData = JSON.parse(localStorage.getItem("tableContent"));

    checkData();
};