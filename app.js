document.addEventListener('DOMContentLoaded', () => {
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const popup = document.getElementById('popup');
  const popupOverlay = document.getElementById('popup-overlay');
  const popupForm = document.getElementById('popup-form');
  const titleInput = document.getElementById('title-input');
  const descriptionInput = document.getElementById('description-input');
  const imageInput = document.getElementById('image-input');
  const currentImage = document.getElementById('current-image');
  const imagePlaceholder = document.getElementById('image-placeholder');

  let currentTaskElement = null;

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

  // Validate image source
  const isImageValid = (imageSrc) => {
    return imageSrc.startsWith('data:image/') || imageSrc.startsWith('http') || imageSrc.startsWith('blob:');
  };

  // Add task to the DOM
  const addTaskToDOM = (task) => {
    const li = document.createElement('li');
    li.className = `flex flex-col p-3 border border-gray-200 rounded-lg ${task.completed ? 'fade-out bg-gray-100' : 'bg-white'}`;

    // Create the image element conditionally
    const imgHTML = task.image && isImageValid(task.image) ? `<img src="${task.image}" class="thumbnail task-image" alt="Task Image">` : '';

    li.innerHTML = `
      <div class="flex items-center">
        ${imgHTML}
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
        titleInput.value = li.querySelector('.task-text').textContent;
        descriptionInput.value = li.querySelector('.task-description')?.textContent || '';

        // Handle current image
        const imageElem = li.querySelector('.task-image');
        if (imageElem) {
          currentImage.src = imageElem.src;
          if (isImageValid(currentImage.src)) {
            currentImage.classList.remove('hidden');
            imagePlaceholder.classList.add('hidden');
          } else {
            currentImage.classList.add('hidden');
            imagePlaceholder.classList.remove('hidden');
          }
        } else {
          currentImage.src = '';
          currentImage.classList.add('hidden');
          imagePlaceholder.classList.remove('hidden');
        }

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
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    let image = '';

    if (title === '') {
      alert('The title cannot be empty.');
      return;
    }

    if (imageInput.files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        image = e.target.result;
        if (isImageValid(image)) {
          updateTaskDetails(currentTaskElement, title, description, image);
        } else {
          alert('This image cannot be processed.');
          imageInput.value = ''; // Clear the file input
        }
      };
      reader.onerror = () => {
        alert('An error occurred while reading the image.');
        imageInput.value = ''; // Clear the file input
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      updateTaskDetails(currentTaskElement, title, description, image);
    }
    popup.classList.remove('active');
    popupOverlay.classList.remove('active');
    resetPopup();
  });

  // Update task details
  const updateTaskDetails = (taskElement, title, description, image) => {
    if (title) {
      taskElement.querySelector('.task-text').textContent = title;
    }
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
    } else {
      const imgElem = taskElement.querySelector('.task-image');
      if (imgElem) {
        imgElem.remove();
      }
    }
    saveTasks();
  };

  // Reset popup fields
  const resetPopup = () => {
    titleInput.value = '';
    descriptionInput.value = '';
    imageInput.value = '';
    currentImage.src = '';
    currentImage.classList.add('hidden');
    imagePlaceholder.classList.remove('hidden');
  };

  // Cancel button functionality
  document.getElementById('cancel-button').addEventListener('click', () => {
    popup.classList.remove('active');
    popupOverlay.classList.remove('active');
    resetPopup();
    currentTaskElement = null;
  });

  // Hide popup when clicking outside
  popupOverlay.addEventListener('click', () => {
    popup.classList.remove('active');
    popupOverlay.classList.remove('active');
    resetPopup();
    currentTaskElement = null;
  });

  // Load tasks on page load
  loadTasks();
});
