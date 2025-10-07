document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const priorityInput = document.getElementById('priority-input');
    const taskListUl = document.getElementById('task-list-ul');
    const progressCircle = document.getElementById('progress-circle');
    const progressText = document.getElementById('progress-text');
    const completedCountEl = document.getElementById('completed-count');
    const pendingCountEl = document.getElementById('pending-count');
    const emptyState = document.getElementById('empty-state');
    const dateDisplay = document.getElementById('date-display');

    dateDisplay.textContent = `System Date: ${new Date().toLocaleDateString('en-CA')}`; // YYYY-MM-DD format

    const radius = progressCircle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    let tasks = JSON.parse(localStorage.getItem('soloTasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('soloTasks', JSON.stringify(tasks));
    };

    const updateProgress = () => {
        const completedTasks = tasks.filter(task => task.completed).length;
        const totalTasks = tasks.length;
        const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        const offset = circumference - (percentage / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        progressText.innerHTML = `<span class="text-4xl font-bold font-orbitron">${percentage}%</span><span class="text-sm text-blue-300">EXP</span>`;

        completedCountEl.textContent = completedTasks;
        pendingCountEl.textContent = totalTasks - completedTasks;

        emptyState.classList.toggle('hidden', totalTasks > 0);
    };

    const renderTasks = () => {
        taskListUl.innerHTML = '';
        // Sort tasks: pending first, then by rank
        const rankOrder = { 's-rank': 0, 'a-rank': 1, 'b-rank': 2, 'c-rank': 3, 'd-rank': 4, 'e-rank': 5 };
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) return a.completed - b.completed;
            return rankOrder[a.priority] - rankOrder[b.priority];
        });

        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item bg-gray-900/70 p-4 rounded-lg flex items-center justify-between mb-3 shadow-md border-l-4 ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            const priorityColors = {
                'e-rank': 'border-slate-400',
                'd-rank': 'border-green-500',
                'c-rank': 'border-blue-500',
                'b-rank': 'border-purple-500',
                'a-rank': 'border-yellow-400',
                's-rank': 'border-red-500',
            }
            li.classList.add(priorityColors[task.priority]);

            li.innerHTML = `
                        <div class="flex items-center">
                            <button class="toggle-btn w-6 h-6 rounded-md border-2 ${task.completed ? 'bg-blue-500 border-blue-400' : 'border-gray-600'} flex items-center justify-center mr-4 transition-colors">
                                ${task.completed ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>' : ''}
                            </button>
                            <span class="task-text">${task.text}</span>
                        </div>
                        <div class="flex items-center gap-2">
                             <button class="delete-btn text-gray-500 hover:text-red-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    `;
            taskListUl.appendChild(li);
        });
        updateProgress();
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: priorityInput.value,
        };
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        taskForm.reset();
        priorityInput.value = 'c-rank';
    });

    taskListUl.addEventListener('click', (e) => {
        const target = e.target;
        const taskLi = target.closest('li.task-item');
        if (!taskLi) return;

        const taskId = Number(taskLi.getAttribute('data-id'));

        if (target.closest('.toggle-btn')) {
            const task = tasks.find(t => t.id === taskId);
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }

        if (target.closest('.delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
        }
    });

    // Initial render
    renderTasks();
});