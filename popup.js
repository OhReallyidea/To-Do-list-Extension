document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todoInput');
  const addBtn = document.getElementById('addBtn');
  const todoList = document.getElementById('todoList');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const taskCount = document.getElementById('taskCount');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');

  let todos = [];

  // Load todos from storage
  loadTodos();

  // Add task
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  // Clear completed
  clearCompletedBtn.addEventListener('click', clearCompleted);

  function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') {
      todoInput.style.borderColor = '#dc3545';
      todoInput.placeholder = 'Please enter a task!';
      setTimeout(() => {
        todoInput.style.borderColor = '#e0e0e0';
        todoInput.placeholder = 'What do you need to do?';
      }, 2000);
      return;
    }

    const todo = {
      id: Date.now(),
      text: text,
      completed: false
    };

    todos.push(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
  }

  function toggleTodo(id) {
    todos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
  }

  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
  }

  function clearCompleted() {
    const hasCompleted = todos.some(todo => todo.completed);
    if (!hasCompleted) return;
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
  }

  function renderTodos() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;

    // Update progress
    const progress = total > 0 ? (completed / total) * 100 : 0;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${completed}/${total}`;

    // Update task count
    taskCount.textContent = `${total} ${total === 1 ? 'task' : 'tasks'}`;

    // Render list
    if (total === 0) {
      todoList.innerHTML = `
        <div class="empty-state">
          <p>✨ No tasks yet</p>
          <p style="font-size: 12px; color: #999;">Add a task above</p>
        </div>
      `;
      return;
    }

    todoList.innerHTML = todos.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <div class="todo-content">
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} />
          <span class="todo-text">${escapeHtml(todo.text)}</span>
        </div>
        <button class="delete-btn" title="Delete task">✕</button>
      </li>
    `).join('');

    // Checkbox events
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const li = e.target.closest('.todo-item');
        const id = parseInt(li.dataset.id);
        toggleTodo(id);
      });
    });

    // Delete events
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const li = e.target.closest('.todo-item');
        const id = parseInt(li.dataset.id);
        deleteTodo(id);
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function saveTodos() {
    chrome.storage.local.set({ todos: todos });
  }

  function loadTodos() {
    chrome.storage.local.get(['todos'], (result) => {
      todos = result.todos || [];
      renderTodos();
    });
  }
});
