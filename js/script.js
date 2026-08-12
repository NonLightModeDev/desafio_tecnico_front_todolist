/* Modelo */
class Task {
  static count = 0

  constructor(description) {
    this.id = this.constructor.count++
    this.description = description
    this.status = 'pending'
  }
}

/* Estado */
const taskList = loadTaskList()

/* localStorage */
function saveTaskList() {
  localStorage.setItem('tasks', JSON.stringify(taskList))
  localStorage.setItem('count', Task.count)
}

function loadTaskList() {
  const data = localStorage.getItem('tasks')

  if (!data) {
    return []
  }

  Task.count = Number(localStorage.getItem('count'))

  return JSON.parse(data)
}

/* Cria a Tarefa */
function createTaskElement(task) {
  const template = document.querySelector('#task-template')
  const element = template.cloneNode(true)

  element.removeAttribute('id')

  const article = element.querySelector('.task')
  const inputCheck = element.querySelector('.task__input-check')
  const description = element.querySelector('.task__description')
  const btnRemoveTask = element.querySelector('.remove-task')
  const btnEditTask = element.querySelector('.edit-task')
  const btnSaveChanges = element.querySelector('.save-changes')
  const btnCancelChanges = element.querySelector('.cancel-changes')

  article.dataset.id = task.id
  article.dataset.status = task.status
  description.value = task.description

  if (task.status === 'completed') {
    article.classList.add('task--completed')
    inputCheck.checked = true
  }

  inputCheck.addEventListener('change', e => {
    updateTaskStatus(article, task, inputCheck)
  })

  btnRemoveTask.addEventListener('click', e => {
    removeTask(task)
    element.remove()
  })

  btnEditTask.addEventListener('click', e => {
    description.disabled = false
    description.focus()
    btnSaveChanges.hidden = false
    btnCancelChanges.hidden = false
    btnEditTask.hidden = true
  })

  btnCancelChanges.addEventListener('click', e => {
    description.value = task.description
    description.disabled = true
    description.blur()
    btnSaveChanges.hidden = true
    btnCancelChanges.hidden = true
    btnEditTask.hidden = false
  })

  btnSaveChanges.addEventListener('click', e => {
    task.description = description.value
    saveTaskList()
    description.disabled = true
    description.blur()
    btnSaveChanges.hidden = true
    btnCancelChanges.hidden = true
    btnEditTask.hidden = false
  })

  element.hidden = false

  document.querySelector('#task-list').append(element)
}

function createTask() {
  const taskInput = document.querySelector('#task-input')
  const task = new Task(taskInput.value.trim())
  taskInput.value = ''
  createTaskElement(task)

  return task
}

/* Remove a tarefa da taskList */
function removeTask(task) {
  const index = taskList.findIndex(t => t.id === task.id)
  taskList.splice(index, 1)
  saveTaskList()
  updateToDoStats()
}

/* Atualiza o status da tarefa */
function updateTaskStatus(element, task, inputCheck) {
  if (inputCheck.checked) {
    element.classList.add('task--completed')
    task.status = 'completed'
  } else {
    element.classList.remove('task--completed')
    task.status = 'pending'
  }

  element.dataset.status = task.status
  saveTaskList()
  updateToDoStats()
}

/* Filtra as tarefas */
function filterTasks(filter) {
  const items = document.querySelectorAll('#task-list > li:not(#task-template)')

  items.forEach(item => {
    const task = item.querySelector('.task')
    const show = filter === 'all' || task.dataset.status === filter

    item.hidden = !show
  })
}

/* Seleciona a opção de filtragem */
function switchTab(tabs, tab) {
  tabs.forEach(tab => {
    tab.classList.remove('task-tabs__tab--active')
  })

  tab.classList.add('task-tabs__tab--active')

  if (tab.id === 'tab-all') {
    filterTasks('all')
  }

  if (tab.id === 'tab-pending') {
    filterTasks('pending')
  }

  if (tab.id === 'tab-completed') {
    filterTasks('completed')
  }
}

/* Carrega as tarefas já adicionadas ao carregar a página */
function loadTasks() {
  taskList.forEach(task => {
    createTaskElement(task)
  })
  updateToDoStats()
}

/* Atualizar estatísticas */
function updateToDoStats() {
  const pendingCount = taskList.filter(task => task.status === 'pending').length
  const completedCount = taskList.filter(
    task => task.status === 'completed'
  ).length
  const totalCount = taskList.length

  document.querySelector('#pending-tasks').textContent = pendingCount
  document.querySelector('#completed-tasks').textContent = completedCount
  document.querySelector('#total-tasks').textContent = totalCount
}

/* Adiciona escutadores de eventos */
const form = document.querySelector('#task-form')
const tabs = document.querySelectorAll('.task-tabs__tab')

form.addEventListener('submit', e => {
  e.preventDefault()
  const task = createTask()
  taskList.push(task)
  saveTaskList()
  const tabAll = document.querySelector('#tab-all')
  switchTab(tabs, tabAll)
  updateToDoStats()
})

tabs.forEach(tab => {
  tab.addEventListener('click', e => {
    switchTab(tabs, tab)
  })
})

/* Carrega tarefas ao carregar a página */
loadTasks()
