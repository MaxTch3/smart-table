import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from "./components/sorting.js";
import {initFiltering} from "./components/filtering.js";
import {initSearching} from "./components/searching.js";


// Исходные данные используемые в render()
const {data, ...indexes} = initData(sourceData);

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));

    // Приводим значения к числам с безопасным дефолтом
    const rowsPerPage = Number.parseInt(state.rowsPerPage);
    const page = Number.parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage: Number.isFinite(rowsPerPage) && rowsPerPage > 0 ? rowsPerPage : 10,
        page: Number.isFinite(page) && page > 0 ? page : 1
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let result = [...data]; // копируем для последующего изменения
    // Применяем последовательные трансформации (фильтрация, сортировка и т.д.)
    // Сначала фильтрация, затем сортировка и пагинация
    if (typeof applySearching === 'function') {
        result = applySearching(result, state, action);
    }
    if (typeof applyFiltering === 'function') {
        result = applyFiltering(result, state, action);
    }
    
    // Сначала сортировка (если есть), затем пагинация
    if (typeof applySorting === 'function') {
        result = applySorting(result, state, action);
    }

    // Пагинация
    if (typeof applyPagination === 'function') {
        result = applyPagination(result, state, action);
    }

    sampleTable.render(result);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// @todo: инициализация

const applyPagination = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const applyFiltering = initFiltering(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers
});

const applySearching = initSearching('search');


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

render();
