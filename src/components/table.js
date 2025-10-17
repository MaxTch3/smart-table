import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    // @todo: #1.2 —  вывести дополнительные шаблоны до и после таблицы
    // Если переданы шаблоны, клонируем их и вставляем в контейнер таблицы.
    // Шаблоны 'before' должны быть вставлены в обратном порядке, если мы используем prepend
    if (Array.isArray(before) && before.length) {
        // Превращаем в копию и идём в обратном порядке чтобы при prepend порядок был как в массиве
        before.slice().reverse().forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.prepend(root[subName].container);
        });
    }

    if (Array.isArray(after) && after.length) {
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.append(root[subName].container);
        });
    }

    // @todo: #1.3 —  обработать события и вызвать onAction()
    // Добавляем обработчики на форму/контейнер таблицы: change, reset, submit
    root.container.addEventListener('change', () => {
        // вызываем onAction без аргументов — ререндер/обновление состояния
        onAction();
    });

    root.container.addEventListener('reset', () => {
        // reset срабатывает раньше, чем значения очистятся; вызываем onAction с малой задержкой
        setTimeout(() => onAction());
    });

    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        // передаём сабмиттер (кнопку) в onAction
        onAction(e.submitter);
    });

    const render = (data) => {
        // @todo: #1.1 — преобразовать данные в массив строк на основе шаблона rowTemplate
        // data ожидается как массив объектов — каждое поле объекта сопоставляется с data-name в шаблоне строки
        data = data || [];
        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);

            // Пробегаем по ключам объекта данных и заполняем соответствующие элементы шаблона
            Object.keys(item).forEach(key => {
                if (row.elements && key in row.elements) {
                    const el = row.elements[key];
                    const tag = el.tagName && el.tagName.toLowerCase();
                    if (tag === 'input' || tag === 'select' || tag === 'textarea') {
                        el.value = item[key];
                    } else {
                        el.textContent = item[key];
                    }
                }
            });

            return row.container;
        });

        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}