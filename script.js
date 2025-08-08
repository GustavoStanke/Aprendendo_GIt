class TodoList { /* Classe principal da aplicação */
    constructor() { /* Inicialização da classe */
        this.todos = JSON.parse(localStorage.getItem('todos')) || []; /* Carrega dados do localStorage */
        this.editingId = null; /* Controla qual tarefa está sendo editada */
        
        this.initializeElements(); /* Inicializa elementos HTML */
        this.bindEvents(); /* Conecta eventos */
        this.render(); /* Renderiza a lista */
    }

    initializeElements() { /* Obtém referências dos elementos HTML */
        this.todoInput = document.getElementById('todoInput'); /* Campo de entrada */
        this.addBtn = document.getElementById('addBtn'); /* Botão adicionar */
        this.todoList = document.getElementById('todoList'); /* Lista de tarefas */
        this.clearAllBtn = document.getElementById('clearAll'); /* Botão limpar */
    }

    bindEvents() { /* Conecta eventos aos elementos */
        this.addBtn.addEventListener('click', () => this.addTodo()); /* Clique no botão adicionar */
        this.todoInput.addEventListener('keypress', (e) => { /* Enter no campo de entrada */
            if (e.key === 'Enter') this.addTodo();
        });
        this.clearAllBtn.addEventListener('click', () => this.clearAll()); /* Clique no botão limpar */
    }

    generateId() { /* Gera ID único para cada tarefa */
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addTodo() { /* Adiciona nova tarefa */
        const text = this.todoInput.value.trim(); /* Obtém texto do campo */
        if (!text) return; /* Sai se estiver vazio */

        const todo = { /* Cria objeto da tarefa */
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.push(todo); /* Adiciona à lista */
        this.saveToLocalStorage(); /* Salva no localStorage */
        this.render(); /* Re-renderiza */
        
        this.todoInput.value = ''; /* Limpa campo */
        this.todoInput.focus(); /* Foca no campo */
    }

    toggleTodo(id) { /* Marca/desmarca tarefa como concluída */
        const todo = this.todos.find(t => t.id === id); /* Encontra tarefa */
        if (todo) {
            todo.completed = !todo.completed; /* Inverte status */
            this.saveToLocalStorage();
            this.render();
        }
    }

    editTodo(id) { /* Inicia edição de uma tarefa */
        const todo = this.todos.find(t => t.id === id);
        if (!todo) return;

        this.editingId = id; /* Define tarefa sendo editada */
        this.render(); /* Re-renderiza para mostrar campo de edição */
        
        setTimeout(() => { /* Aguarda DOM atualizar */
            const editInput = document.querySelector(`[data-edit-id="${id}"]`);
            if (editInput) {
                editInput.focus(); /* Foca no campo */
                editInput.select(); /* Seleciona texto */
            }
        }, 100);
    }

    saveEdit(id) { /* Salva edição de uma tarefa */
        const editInput = document.querySelector(`[data-edit-id="${id}"]`);
        if (!editInput) return;

        const newText = editInput.value.trim(); /* Obtém novo texto */
        if (!newText) { /* Se vazio, remove tarefa */
            this.deleteTodo(id);
            return;
        }

        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.text = newText; /* Atualiza texto */
            this.saveToLocalStorage();
            this.editingId = null; /* Para edição */
            this.render();
        }
    }

    cancelEdit() { /* Cancela edição */
        this.editingId = null;
        this.render();
    }

    deleteTodo(id) { /* Remove uma tarefa */
        this.todos = this.todos.filter(t => t.id !== id); /* Filtra tarefa */
        this.saveToLocalStorage();
        this.render();
    }

    clearAll() { /* Remove todas as tarefas */
        if (confirm('Limpar todas as tarefas?')) {
            this.todos = []; /* Esvazia lista */
            this.saveToLocalStorage();
            this.render();
        }
    }

    render() { /* Renderiza lista de tarefas */
        if (this.todos.length === 0) { /* Se não há tarefas */
            this.todoList.innerHTML = ` 
                <div class="empty-state">
                    <h3>Nenhuma tarefa</h3>
                    <p>Adicione uma tarefa acima</p>
                </div>
            `;
            return;
        }

        this.todoList.innerHTML = this.todos.map(todo => { /* Mapeia tarefas para HTML */
            const isEditing = this.editingId === todo.id; /* Verifica se está editando */
            
            return ` 
                <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <input type="checkbox" 
                           class="todo-checkbox" 
                           ${todo.completed ? 'checked' : ''} 
                           onchange="todoApp.toggleTodo('${todo.id}')">
                    
                    ${isEditing ? 
                        `<input type="text" 
                                class="todo-text" 
                                data-edit-id="${todo.id}"
                                value="${todo.text}" 
                                onkeypress="if(event.key === 'Enter') todoApp.saveEdit('${todo.id}')" 
                                onblur="todoApp.saveEdit('${todo.id}')" 
                                onkeyup="if(event.key === 'Escape') todoApp.cancelEdit()">` :
                        `<span class="todo-text">${todo.text}</span>`
                    }
                    
                    <div class="todo-actions-item">
                        ${!isEditing ? 
                            `<button class="edit-btn" onclick="todoApp.editTodo('${todo.id}')" title="Editar">✏️</button>` :
                            `<button class="edit-btn" onclick="todoApp.cancelEdit()" title="Cancelar">❌</button>`
                        }
                        <button class="delete-btn" onclick="todoApp.deleteTodo('${todo.id}')" title="Excluir">🗑️</button>
                    </div>
                </li>
            `;
        }).join('');
    }

    saveToLocalStorage() { /* Salva tarefas no localStorage */
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

const todoApp = new TodoList(); /* Cria instância da aplicação */

if (todoApp.todos.length === 0) { /* Se não há tarefas salvas */
    const sampleTodos = [ /* Tarefas de exemplo */
        { id: todoApp.generateId(), text: 'Bem-vindo!', completed: false, createdAt: new Date().toISOString() },
        { id: todoApp.generateId(), text: 'Clique na caixa para marcar como concluída', completed: false, createdAt: new Date().toISOString() },
        { id: todoApp.generateId(), text: 'Use os ícones para editar e excluir', completed: false, createdAt: new Date().toISOString() }
    ];
    todoApp.todos = sampleTodos; /* Define tarefas de exemplo */
    todoApp.saveToLocalStorage();
    todoApp.render();
}
