// Task Planner Application
class TaskPlanner {
    constructor() {
        this.tasks = [];
        this.categories = [
            {id: 1, name: "Красота", color: "#ff00ff", glowColor: "rgba(255, 0, 255, 0.7)"},
            {id: 2, name: "Точка силы", color: "#00ffff", glowColor: "rgba(0, 255, 255, 0.7)"},
            {id: 3, name: "Продвижение", color: "#00ff00", glowColor: "rgba(0, 255, 0, 0.7)"},
            {id: 4, name: "Финансы", color: "#ff9900", glowColor: "rgba(255, 153, 0, 0.7)"},
            {id: 5, name: "Рутина", color: "#cc00ff", glowColor: "rgba(204, 0, 255, 0.7)"}
        ];
        
        // Текущий месяц и год
        this.month = 6; // Июнь по умолчанию
        this.year = 2025;
        this.daysInMonth = new Date(this.year, this.month, 0).getDate();
        
        this.days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
        this.shortDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
        this.monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
        
        this.currentFilter = '';
        this.currentSearch = '';
        this.selectedDate = null;
        this.editingTaskId = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadTasks();
        this.renderMonthHeader();
        this.renderMonthGrid();
        this.bindEvents();
        this.updateStats();
    }

    loadTasks() {
        // Загрузка задач из localStorage
        const savedTasks = localStorage.getItem('neoplanner_tasks');
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
            } catch (e) {
                console.error('Ошибка при загрузке задач:', e);
                this.tasks = [];
            }
        }
    }

    saveTasks() {
        // Сохранение задач в localStorage
        try {
            localStorage.setItem('neoplanner_tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Ошибка при сохранении задач:', e);
            this.showNotification('Не удалось сохранить задачи', 'error');
        }
    }

    renderMonthHeader() {
        const monthHeader = document.getElementById('monthHeader');
        if (!monthHeader) return;

        // Очищаем заголовок месяца
        monthHeader.innerHTML = '';

        // Создаем элементы навигации по месяцам
        const prevMonthBtn = document.createElement('button');
        prevMonthBtn.className = 'btn btn--secondary month-nav-btn';
        prevMonthBtn.innerHTML = '&laquo;';
        prevMonthBtn.title = 'Предыдущий месяц';
        prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));

        const monthTitle = document.createElement('h2');
        monthTitle.className = 'month-title';
        monthTitle.textContent = `${this.monthNames[this.month - 1]} ${this.year}`;

        const nextMonthBtn = document.createElement('button');
        nextMonthBtn.className = 'btn btn--secondary month-nav-btn';
        nextMonthBtn.innerHTML = '&raquo;';
        nextMonthBtn.title = 'Следующий месяц';
        nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

        // Добавляем элементы в заголовок месяца
        monthHeader.appendChild(prevMonthBtn);
        monthHeader.appendChild(monthTitle);
        monthHeader.appendChild(nextMonthBtn);
    }

    changeMonth(delta) {
        // Изменяем месяц на delta (-1 для предыдущего, 1 для следующего)
        let newMonth = this.month + delta;
        let newYear = this.year;

        // Обрабатываем переход между годами
        if (newMonth < 6) {
            // Не позволяем перейти раньше июня 2025
            newMonth = 6;
            newYear = 2025;
        } else if (newMonth > 12) {
            // Не позволяем перейти дальше декабря 2025
            newMonth = 12;
            newYear = 2025;
        }

        // Если месяц изменился, обновляем отображение
        if (newMonth !== this.month || newYear !== this.year) {
            this.month = newMonth;
            this.year = newYear;
            this.daysInMonth = new Date(this.year, this.month, 0).getDate();
            this.renderMonthHeader();
            this.renderMonthGrid();
        }
    }

    renderMonthGrid() {
        const monthGrid = document.getElementById('monthGrid');
        if (!monthGrid) return;

        monthGrid.innerHTML = '';

        // Дни текущего месяца, по 3 дня в строке
        const totalDays = this.daysInMonth;
        const rowsNeeded = Math.ceil(totalDays / 3);

        // Получаем текущую дату для выделения сегодняшнего дня
        const today = new Date();
        const isCurrentMonth = today.getMonth() + 1 === this.month && today.getFullYear() === this.year;
        const currentDate = today.getDate();

        // Создаем сетку месяца
        for (let row = 0; row < rowsNeeded; row++) {
            // Создаем контейнер для строки дней и заметок
            const rowContainer = document.createElement('div');
            rowContainer.className = 'row-container';
            rowContainer.style.display = 'flex';
            rowContainer.style.marginBottom = '16px';
            
            // Создаем контейнер для строки дней
            const weekRow = document.createElement('div');
            weekRow.className = 'week-row';
            weekRow.style.display = 'flex';
            weekRow.style.flex = '3';
            weekRow.style.gap = '16px';

            for (let col = 0; col < 3; col++) {
                const dayIndex = row * 3 + col;
                const date = dayIndex + 1;

                // Если день выходит за пределы месяца, пропускаем
                if (date > totalDays) continue;

                const dayCell = document.createElement('div');
                dayCell.className = 'day-cell';
                dayCell.style.flex = '1';
                dayCell.setAttribute('data-date', `${this.year}-${this.month.toString().padStart(2, '0')}-${date.toString().padStart(2, '0')}`);
                
                // Проверяем, является ли этот день сегодняшним
                if (isCurrentMonth && date === currentDate) {
                    dayCell.classList.add('today');
                }

                // Добавляем заголовок дня
                const dayHeader = document.createElement('div');
                dayHeader.className = 'day-header';
                
                const dayNumber = document.createElement('div');
                dayNumber.className = 'day-number';
                dayNumber.textContent = date;
                
                // Добавляем день недели
                const dayOfWeek = new Date(this.year, this.month - 1, date).getDay() || 7; // 0 - воскресенье, 1 - понедельник
                const dayName = document.createElement('div');
                dayName.className = 'day-name';
                dayName.textContent = this.days[dayOfWeek - 1];
                
                dayHeader.appendChild(dayNumber);
                dayHeader.appendChild(dayName);
                dayCell.appendChild(dayHeader);

                // Добавляем контейнер для задач
                const dayTasks = document.createElement('div');
                dayTasks.className = 'day-tasks';
                dayTasks.id = `tasks-${date}`;
                dayCell.appendChild(dayTasks);

                weekRow.appendChild(dayCell);
            }
            
            // Добавляем поле для заметок для этой строки
            const notesContainer = document.createElement('div');
            notesContainer.className = 'notes-container';
            notesContainer.style.flex = '1';
            notesContainer.style.marginLeft = '16px';
            
            const notesHeader = document.createElement('div');
            notesHeader.className = 'notes-header';
            notesHeader.textContent = 'ЗАМЕТКИ';
            notesHeader.style.color = '#ffffff';
            notesHeader.style.textAlign = 'center';
            notesHeader.style.marginBottom = '10px';
            notesHeader.style.fontSize = '20px';
            
            const notesContent = document.createElement('div');
            notesContent.className = 'notes-content';
            notesContent.style.height = '100%';
            
            const notesTextarea = document.createElement('textarea');
            notesTextarea.className = 'notes-textarea';
            notesTextarea.placeholder = 'Введите заметки для этих дней...';
            notesTextarea.id = `notes-row-${this.month}-${row}`;
            notesTextarea.style.width = '100%';
            notesTextarea.style.height = 'calc(100% - 40px)';
            notesTextarea.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            notesTextarea.style.color = 'var(--color-neon-green)';
            notesTextarea.style.border = '1px solid #333333';
            notesTextarea.style.borderRadius = '8px';
            notesTextarea.style.padding = '10px';
            notesTextarea.style.fontFamily = "'Times New Roman', Times, serif";
            notesTextarea.style.fontSize = '18px';
            notesTextarea.style.fontWeight = 'normal';
            notesTextarea.style.textTransform = 'none';
            notesTextarea.style.letterSpacing = 'normal';
            notesTextarea.style.textShadow = 'none';
            
            // Загружаем сохраненные заметки, если они есть
            const savedNotes = localStorage.getItem(`neoplanner_notes_${this.month}_${row}`);
            if (savedNotes) {
                notesTextarea.value = savedNotes;
            }
            
            // Сохраняем заметки при изменении
            notesTextarea.addEventListener('input', (e) => {
                localStorage.setItem(`neoplanner_notes_${this.month}_${row}`, e.target.value);
            });
            
            notesContent.appendChild(notesTextarea);
            notesContainer.appendChild(notesHeader);
            notesContainer.appendChild(notesContent);
            
            // Добавляем строку дней и заметки в контейнер строки
            rowContainer.appendChild(weekRow);
            rowContainer.appendChild(notesContainer);
            
            // Добавляем контейнер строки в сетку месяца
            monthGrid.appendChild(rowContainer);
        }

        // Отображаем задачи
        this.renderTasks();

        // Добавляем обработчики событий для ячеек дней
        const dayCells = document.querySelectorAll('.day-cell');
        dayCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (e.target.closest('.task-item') || e.target.closest('.task-edit-btn')) return; // Игнорируем клики по задачам и кнопкам
                
                const date = cell.getAttribute('data-date');
                if (date) {
                    this.selectedDate = date;
                    this.editingTaskId = null; // Сбрасываем ID редактируемой задачи
                    this.showModal();
                }
            });
        });
    }

    bindEvents() {
        // Add task button
        const addTaskBtn = document.getElementById('addTaskBtn');
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => {
                this.selectedDate = this.getCurrentDateString();
                this.editingTaskId = null; // Сбрасываем ID редактируемой задачи
                this.showModal();
            });
        }

        // Modal events
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        const taskModal = document.getElementById('taskModal');
        if (taskModal) {
            taskModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideModal();
                }
            });
        }

        // Task details modal
        const closeDetailsModalBtn = document.getElementById('closeDetailsModal');
        if (closeDetailsModalBtn) {
            closeDetailsModalBtn.addEventListener('click', () => {
                this.hideTaskDetailsModal();
            });
        }

        const taskDetailsModal = document.getElementById('taskDetailsModal');
        if (taskDetailsModal) {
            taskDetailsModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideTaskDetailsModal();
                }
            });
        }

        // Form submission
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.editingTaskId) {
                    this.updateTask();
                } else {
                    this.addTask();
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value.toLowerCase();
                this.renderTasks();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTasks();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideTaskDetailsModal();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.selectedDate = this.getCurrentDateString();
                this.editingTaskId = null; // Сбрасываем ID редактируемой задачи
                this.showModal();
            }
        });
    }

    getCurrentDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    showModal(isEditing = false) {
        const modal = document.getElementById('taskModal');
        const modalTitle = modal.querySelector('.modal-header h2');
        const submitBtn = modal.querySelector('button[type="submit"]');
        const titleInput = document.getElementById('taskTitle');
        const categoryInput = document.getElementById('taskCategory');
        const dateInput = document.getElementById('taskDate');
        const timeInput = document.getElementById('taskTime');
        
        if (modal) {
            modal.classList.add('active');
        }
        
        // Изменяем заголовок и текст кнопки в зависимости от режима
        if (isEditing) {
            modalTitle.textContent = 'Изменить задачу';
            submitBtn.textContent = 'Сохранить';
            
            // Заполняем форму данными редактируемой задачи
            const task = this.tasks.find(t => t.id === this.editingTaskId);
            if (task) {
                titleInput.value = task.title;
                categoryInput.value = task.category;
                dateInput.value = task.date;
                timeInput.value = task.time;
            }
        } else {
            modalTitle.textContent = 'Добавить задачу';
            submitBtn.textContent = 'Добавить';
            
            if (dateInput && this.selectedDate) {
                dateInput.value = this.selectedDate;
            }
        }
        
        if (titleInput) {
            // Small delay to ensure modal is visible before focusing
            setTimeout(() => {
                titleInput.focus();
            }, 100);
        }
    }

    hideModal() {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        if (form) {
            form.reset();
        }
        
        this.selectedDate = null;
        this.editingTaskId = null;
    }

    showTaskDetailsModal(task) {
        const modal = document.getElementById('taskDetailsModal');
        const content = document.getElementById('taskDetailsContent');
        
        if (!modal || !content || !task) return;
        
        const category = this.categories.find(c => c.id === task.category);
        const categoryName = category ? category.name : 'Категория не найдена';
        const displayTime = task.time === 'all-day' ? 'Весь день' : task.time;
        
        // Форматируем дату
        const dateObj = new Date(task.date);
        const formattedDate = dateObj.toLocaleDateString('ru-RU', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        });
        
        content.innerHTML = `
            <div class="task-details">
                <h3 class="task-details-title">${this.escapeHtml(task.title)}</h3>
                <div class="task-details-info">
                    <div class="task-details-row">
                        <span class="task-details-label">Категория:</span>
                        <span class="task-details-value">${this.escapeHtml(categoryName)}</span>
                    </div>
                    <div class="task-details-row">
                        <span class="task-details-label">Дата:</span>
                        <span class="task-details-value">${formattedDate}</span>
                    </div>
                    <div class="task-details-row">
                        <span class="task-details-label">Время:</span>
                        <span class="task-details-value">${displayTime}</span>
                    </div>
                </div>
                <div class="task-details-actions">
                    <button class="btn btn--secondary" id="editTaskBtn">Изменить</button>
                    <button class="btn btn--danger" id="deleteTaskBtn">Удалить</button>
                </div>
            </div>
        `;
        
        // Добавляем обработчики событий для кнопок
        const editBtn = content.querySelector('#editTaskBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.hideTaskDetailsModal();
                this.editingTaskId = task.id;
                this.showModal(true);
            });
        }
        
        const deleteBtn = content.querySelector('#deleteTaskBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
                    this.deleteTask(task.id);
                    this.hideTaskDetailsModal();
                }
            });
        }
        
        modal.classList.add('active');
    }

    hideTaskDetailsModal() {
        const modal = document.getElementById('taskDetailsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    addTask() {
        const titleInput = document.getElementById('taskTitle');
        const categoryInput = document.getElementById('taskCategory');
        const dateInput = document.getElementById('taskDate');
        const timeInput = document.getElementById('taskTime');
        
        if (!titleInput || !categoryInput || !dateInput || !timeInput) return;
        
        const title = titleInput.value.trim();
        const category = parseInt(categoryInput.value);
        const date = dateInput.value;
        const time = timeInput.value;
        
        if (!title || !category || !date) {
            this.showNotification('Пожалуйста, заполните обязательные поля', 'error');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            title,
            category,
            date,
            time: time || '', // Если время не указано, сохраняем пустую строку
            completed: false
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.hideModal();
        this.showNotification('Задача добавлена', 'success');
    }

    updateTask() {
        const titleInput = document.getElementById('taskTitle');
        const categoryInput = document.getElementById('taskCategory');
        const dateInput = document.getElementById('taskDate');
        const timeInput = document.getElementById('taskTime');
        
        if (!titleInput || !categoryInput || !dateInput || !timeInput || !this.editingTaskId) return;
        
        const title = titleInput.value.trim();
        const category = parseInt(categoryInput.value);
        const date = dateInput.value;
        const time = timeInput.value;
        
        if (!title || !category || !date) {
            this.showNotification('Пожалуйста, заполните обязательные поля', 'error');
            return;
        }
        
        const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
        if (taskIndex === -1) return;
        
        this.tasks[taskIndex] = {
            ...this.tasks[taskIndex],
            title,
            category,
            date,
            time: time || '' // Если время не указано, сохраняем пустую строку
        };
        
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.hideModal();
        this.showNotification('Задача обновлена', 'success');
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.showNotification('Задача удалена', 'success');
    }

    toggleTaskCompletion(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        
        this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    renderTasks() {
        // Очищаем все контейнеры задач
        const taskContainers = document.querySelectorAll('.day-tasks');
        taskContainers.forEach(container => {
            container.innerHTML = '';
        });
        
        // Фильтруем задачи по категории и поисковому запросу
        const filteredTasks = this.tasks.filter(task => {
            const matchesFilter = !this.currentFilter || task.category.toString() === this.currentFilter;
            const matchesSearch = !this.currentSearch || task.title.toLowerCase().includes(this.currentSearch);
            return matchesFilter && matchesSearch;
        });
        
        // Группируем задачи по датам
        const tasksByDate = {};
        
        // Сначала обрабатываем обычные задачи
        filteredTasks.forEach(task => {
            const [year, month, day] = task.date.split('-');
            // Проверяем, соответствует ли задача текущему месяцу и году
            if (parseInt(month) === this.month && parseInt(year) === this.year) {
                const dayKey = parseInt(day);
                if (!tasksByDate[dayKey]) {
                    tasksByDate[dayKey] = [];
                }
                
                // Если задача на "весь день", добавляем её ко всем дням месяца
                if (task.time === 'all-day') {
                    // Создаем копии задачи для всех дней месяца
                    for (let i = 1; i <= this.daysInMonth; i++) {
                        if (!tasksByDate[i]) {
                            tasksByDate[i] = [];
                        }
                        // Добавляем задачу только если она еще не добавлена для этого дня
                        // Используем оригинальный ID для идентификации задачи
                        const alreadyAdded = tasksByDate[i].some(t => t.id === task.id);
                        if (!alreadyAdded) {
                            tasksByDate[i].push({...task, isAllDay: true});
                        }
                    }
                } else {
                    // Обычные задачи добавляем только к их дате
                    tasksByDate[dayKey].push(task);
                }
            }
        });
        
        // Отображаем задачи в соответствующих днях
        for (const [day, tasks] of Object.entries(tasksByDate)) {
            const dayContainer = document.getElementById(`tasks-${day}`);
            if (!dayContainer) continue;
            
            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'task-completed' : ''}`;
                taskElement.setAttribute('data-task-id', task.id);
                
                // Если это задача "весь день", добавляем специальный класс
                if (task.time === 'all-day') {
                    taskElement.classList.add('task-all-day');
                }
                
                // Находим категорию для определения цвета времени
                const category = this.categories.find(c => c.id === task.category);
                // Убираем установку рамок и теней для задач
                
                // Создаем контейнер для трехстрочной структуры
                const taskContainer = document.createElement('div');
                taskContainer.className = 'task-container';
                
                // Создаем контейнер для верхней строки (время + галочка)
                const topRowContainer = document.createElement('div');
                topRowContainer.className = 'task-top-row';
                
                // Добавляем время выполнения с подсветкой по категории
                const taskTime = document.createElement('div');
                taskTime.className = 'task-time';
                taskTime.textContent = task.time === 'all-day' ? 'Весь день' : (task.time || '--:--');
                
                // Используем найденную категорию для определения цвета времени и левой границы
                if (category) {
                    taskTime.style.color = category.color;
                    taskTime.style.textShadow = `0 0 5px ${category.glowColor}`;
                    taskElement.style.borderLeftColor = category.color;
                    taskElement.style.boxShadow = `0 0 5px ${category.glowColor}`;
                }
                
                // Добавляем чекбокс для отметки выполнения рядом со временем
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'task-checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation(); // Предотвращаем всплытие события
                    this.toggleTaskCompletion(task.id);
                });
                
                // Добавляем время и чекбокс в верхнюю строку
                topRowContainer.appendChild(taskTime);
                topRowContainer.appendChild(checkbox);
                
                // Добавляем текст задачи на второй строке
                const taskContent = document.createElement('div');
                taskContent.className = 'task-content';
                taskContent.textContent = task.title;
                
                // Добавляем кнопку редактирования
                const editButton = document.createElement('button');
                editButton.className = 'task-edit-btn';
                editButton.innerHTML = '&#9998;'; // Иконка карандаша
                editButton.title = 'Изменить задачу';
                editButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Предотвращаем всплытие события
                    this.editingTaskId = task.id;
                    this.showModal(true);
                });
                
                // Добавляем элементы в двухстрочной структуре
                taskContainer.appendChild(topRowContainer);
                taskContainer.appendChild(taskContent);
                
                // Добавляем контейнер и кнопку редактирования в основной элемент задачи
                taskElement.appendChild(taskContainer);
                taskElement.appendChild(editButton);
                
                // Добавляем обработчик клика для просмотра деталей задачи
                taskElement.addEventListener('click', (e) => {
                    if (e.target !== checkbox && e.target !== editButton) {
                        this.showTaskDetailsModal(task);
                    }
                });
                
                dayContainer.appendChild(taskElement);
            });
        }
    }

    updateStats() {
        // Обновляем статистику по категориям
        this.categories.forEach(category => {
            const statElement = document.getElementById(`stat-${category.id}`);
            if (!statElement) return;
            
            const totalTasks = this.tasks.filter(t => t.category === category.id).length;
            const completedTasks = this.tasks.filter(t => t.category === category.id && t.completed).length;
            
            statElement.textContent = `${completedTasks}/${totalTasks}`;
        });
    }

    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        // Добавляем уведомление в DOM
        document.body.appendChild(notification);
        
        // Анимируем появление
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskPlanner();
    
    // Добавляем стили для модальных окон
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .modal-overlay.active {
            display: flex;
        }
        
        .modal {
            background-color: rgba(0, 0, 0, 0.9);
            border-radius: 8px;
            border: 1px solid rgba(0, 255, 255, 0.3);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.5);
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border-bottom: 1px solid rgba(0, 255, 255, 0.2);
        }
        
        .modal-header h2 {
            margin: 0;
            color: rgba(0, 255, 255, 1);
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
        }
        
        .close-btn {
            background: none;
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        
        .modal-body {
            padding: 16px;
        }
        
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 16px;
        }
        
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: #fff;
            font-weight: 500;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            transform: translateY(100px);
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
            z-index: 2000;
        }
        
        .notification.active {
            transform: translateY(0);
            opacity: 1;
        }
        
        .notification--success {
            background-color: rgba(0, 255, 204, 0.9);
            border: 1px solid rgba(0, 255, 204, 0.5);
            box-shadow: 0 0 10px rgba(0, 255, 204, 0.7);
        }
        
        .notification--error {
            background-color: rgba(255, 51, 102, 0.9);
            border: 1px solid rgba(255, 51, 102, 0.5);
            box-shadow: 0 0 10px rgba(255, 51, 102, 0.7);
        }
        
        .notification--info {
            background-color: rgba(0, 204, 255, 0.9);
            border: 1px solid rgba(0, 204, 255, 0.5);
            box-shadow: 0 0 10px rgba(0, 204, 255, 0.7);
        }
        
        .task-item {
            display: flex;
            align-items: flex-start;
            padding: 8px;
            margin-bottom: 8px;
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.5);
            border-left: 3px solid #00ffff;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .task-item:hover {
            background-color: rgba(0, 0, 0, 0.7);
        }
        
        .task-time {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.7);
            margin-right: 8px;
            min-width: 50px;
        }
        
        .task-checkbox {
            margin-right: 8px;
            margin-top: 3px;
        }
        
        .task-content {
            flex-grow: 1;
            white-space: normal;
            overflow: visible;
            word-break: break-word;
        }
        
        .task-edit-btn {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            padding: 2px 5px;
            font-size: 14px;
            visibility: hidden;
            transition: color 0.2s;
        }
        
        .task-item:hover .task-edit-btn {
            visibility: visible;
        }
        
        .task-edit-btn:hover {
            color: #fff;
        }
        
        .task-completed .task-content {
            text-decoration: line-through;
            color: rgba(255, 255, 255, 0.5);
        }
        
        .task-details-title {
            margin-bottom: 16px;
            color: #fff;
        }
        
        .task-details-info {
            margin-bottom: 16px;
        }
        
        .task-details-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .task-details-label {
            font-weight: 500;
            color: rgba(0, 255, 255, 0.9);
            width: 100px;
        }
        
        .task-details-value {
            color: #fff;
        }
        
        .task-details-actions {
            display: flex;
            gap: 8px;
        }
    `;
    document.head.appendChild(style);
});
