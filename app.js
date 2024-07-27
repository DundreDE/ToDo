document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const popup = document.getElementById('popup');
  const popupOverlay = document.getElementById('popup-overlay');
  const popupForm = document.getElementById('popup-form');
  const descriptionInput = document.getElementById('description-input');
  const imageInput = document.getElementById('image-input');

  let currentTaskElement;

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
        description: li.querySelector('.task-description')?.textContent || '',
        image: li.querySelector('.task-image')?.src || '',
        completed: li.classList.contains('fade-out')
      });
    });
    localStorage.setItem('todos', JSON.stringify(tasks));
  };

  // Add task to the DOM
  const addTaskToDOM = (task) => {
    const li = document.createElement('li');
    li.className = `flex flex-col p-3 border border-gray-200 rounded-lg ${task.completed ? 'fade-out bg-gray-100' : 'bg-white'}`;
    
    li.innerHTML = `
      <div class="flex items-center">
        ${task.image ? `<img src="${task.image}" class="thumbnail task-image" alt="Task Image">` : ''}
        <div class="flex-1">
          <span class="task-text ${task.completed ? 'text-gray-500' : 'text-gray-800'}">${task.text}</span>
          ${task.description ? `<hr><p class="task-description">${task.description}</p>` : ''}
        </div>
      </div>
      <div class="button-group mt-2">
        <button class="btn ${task.completed ? 'btn-undo' : 'btn-done'}">${task.completed ? 'Undo' : 'Done'}</button>
        <button class="btn btn-delete">Delete</button>
      </div>
    `;

    // Toggle task completion
    li.querySelector('.btn-done, .btn-undo').addEventListener('click', (e) => {
      e.stopPropagation();
      li.classList.toggle('fade-out');
      li.classList.toggle('bg-gray-100');
      li.querySelector('.task-text').classList.toggle('text-gray-500');
      const btn = li.querySelector('.btn-done, .btn-undo');
      if (btn) {
        btn.textContent = li.classList.contains('fade-out') ? 'Undo' : 'Done';
        btn.className = `btn ${li.classList.contains('fade-out') ? 'btn-undo' : 'btn-done'}`;
      }

      // Move completed tasks to the end
      if (li.classList.contains('fade-out')) {
        todoList.appendChild(li);
      } else {
        todoList.prepend(li);
      }

      saveTasks();
    });

    // Delete task
    li.querySelector('.btn-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      li.remove();
      saveTasks();
    });

    // Show popup for editing task details
    li.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        currentTaskElement = li;
        descriptionInput.value = li.querySelector('.task-description')?.textContent || '';
        imageInput.value = '';
        popup.classList.add('active');
        popupOverlay.classList.add('active');
      }
    });

    if (task.completed) {
      todoList.appendChild(li);
    } else {
      todoList.prepend(li);
    }
  };

  // Add new task
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = todoInput.value.trim();
    if (taskText !== '') {
      const newTask = { text: taskText, description: '', image: '', completed: false };
      addTaskToDOM(newTask);
      saveTasks();
      todoInput.value = '';
    }
  });

  // Handle popup form submission
  popupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = descriptionInput.value.trim();
    let image = '';
    if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        image = e.target.result;
        updateTaskDetails(currentTaskElement, description, image);
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      updateTaskDetails(currentTaskElement, description, image);
    }
    popup.classList.remove('active');
    popupOverlay.classList.remove('active');
  });

  const updateTaskDetails = (taskElement, description, image) => {
    if (description) {
      const descElem = taskElement.querySelector('.task-description');
      if (descElem) {
        descElem.textContent = description;
      } else {
        const descElem = document.createElement('p');
        descElem.className = 'task-description';
        descElem.textContent = description;
        taskElement.querySelector('.flex-1').appendChild(descElem);
      }
    }
    if (image) {
      const imgElem = taskElement.querySelector('.task-image');
      if (imgElem) {
        imgElem.src = image;
      } else {
        const imgElem = document.createElement('img');
        imgElem.src = image;
        imgElem.className = 'thumbnail task-image';
        taskElement.insertBefore(imgElem, taskElement.firstChild);
      }
    }
    saveTasks();
  };

  // Hide popup when clicking outside
  popupOverlay.addEventListener('click', () => {
    popup.classList.remove('active');
    popupOverlay.classList.remove('active');
  });

  // Load tasks on page load
  loadTasks();
});
