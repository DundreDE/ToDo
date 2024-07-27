document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');

  // Load tasks from LocalStorage
  const loadTasks = () => {
    const tasks = JSON.parse(localStorage.getItem('todos')) || [];
    tasks.forEach(task => {
      addTaskToDOM(task);
    });
  };

  // Save tasks to LocalStorage
  const saveTasks = () => {
    const tasks = [];
    todoList.querySelectorAll('li').forEach(li => {
      tasks.push({
        text: li.querySelector('.task-text').textContent,
        completed: li.classList.contains('fade-out')
      });
    });
    localStorage.setItem('todos', JSON.stringify(tasks));
  };

  // Add task to the DOM
  const addTaskToDOM = (task) => {
    const li = document.createElement('li');
    li.className = `flex justify-between items-center p-3 border border-gray-200 rounded-lg ${task.completed ? 'fade-out bg-gray-100' : 'bg-white'}`;
    li.innerHTML = `
      <span class="task-text flex-1 ${task.completed ? 'text-gray-500' : 'text-gray-800'}">${task.text}</span>
      <button class="delete-btn text-red-500 ml-4 hover:text-red-700">x</button>
    `;

    // Mark task as completed
    li.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        li.classList.toggle('fade-out');
        li.classList.toggle('bg-gray-100');
        li.querySelector('.task-text').classList.toggle('text-gray-500');
        saveTasks();
      }
    });

    // Delete task
    li.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      li.remove();
      saveTasks();
    });

    todoList.appendChild(li);
  };

  // Add new task
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    if (taskText !== '') {
      const newTask = { text: taskText, completed: false };
      addTaskToDOM(newTask);
      saveTasks();
      todoInput.value = '';
    }
  });

  // Load tasks on page load
  loadTasks();
});
