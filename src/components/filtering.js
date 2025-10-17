import {createComparison, defaultRules} from "../lib/compare.js";

// @todo: #4.3 — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // @todo: #4.1 — заполнить выпадающие списки опциями
    if (indexes && elements) {
        Object.keys(indexes).forEach((elementName) => {
            const el = elements[elementName];
            if (!el) return;
            const options = Object.values(indexes[elementName]).map(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name;
                return opt;
            });
            el.append(...options);
        });
    }

    return (data, state, action) => {
        // @todo: #4.2 — обработать очистку поля
        if (action && action.name === 'clear') {
            const field = action.dataset.field;
            const parent = action.closest('label') || action.parentElement;
            if (parent) {
                const input = parent.querySelector('input, select, textarea');
                if (input) input.value = '';
            }
            // Обновляем state, если поле присутствует
            if (field && state) {
                state[field] = '';
            }
        }

        // @todo: #4.5 — отфильтровать данные используя компаратор
        // Копируем state в target и формируем поле total как массив [from, to]
        const target = {...state};
        const rawFrom = state && state.totalFrom;
        const rawTo = state && state.totalTo;

        const from = rawFrom === undefined || rawFrom === '' ? undefined : Number(rawFrom);
        const to = rawTo === undefined || rawTo === '' ? undefined : Number(rawTo);

        // Если оба не числа — не добавляем фильтр по total
        if ((from !== undefined && !Number.isNaN(from)) || (to !== undefined && !Number.isNaN(to))) {
            let a = Number.isFinite(from) ? from : undefined;
            let b = Number.isFinite(to) ? to : undefined;

            // Если пользователь по ошибке ввёл from > to — поменяем
            if (a !== undefined && b !== undefined && a > b) {
                const tmp = a; a = b; b = tmp;
            }

            target.total = [a, b];
        }

        return data.filter(row => compare(row, target));
    }
}