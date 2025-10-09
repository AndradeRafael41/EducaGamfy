import React from 'react';

// Mocks de dados baseados nas tabelas tasks [14, 15] e task_submissions [15]
const mockTasks = [
    { 
        id: 101, 
        title: "Leitura de Capítulo 3: Os Oceanos", 
        max_points: 100, // max_points [15]
        due_date: "15/10/2025", 
        submissions_status: "15/28 Enviadas", 
        pending_evaluation: 7 // Contagem de 'status: pending' na task_submissions [15]
    },
    { 
        id: 102, 
        title: "Desafio de Matemática - Adição", 
        max_points: 50, 
        due_date: "08/10/2025", 
        submissions_status: "28/28 Enviadas", 
        pending_evaluation: 0 
    },
    { 
        id: 103, 
        title: "Relatório de Livro 'A Casa Monstro'", 
        max_points: 75, 
        due_date: "20/10/2025", 
        submissions_status: "20/28 Enviadas", 
        pending_evaluation: 5 
    },
];

const TaskList = () => {
  return (
    <div className="task-list-component">
      <h3>Lista de Atividades Ativas</h3>
      
      {mockTasks.map((task) => (
        <div key={task.id} className="task-item">
          <div className="task-info">
            <h4>{task.title}</h4>
            <p>Pontuação Máxima: **{task.max_points}** | Prazo: {task.due_date}</p>
          </div>
          
          <div className="evaluation-status">
            <span className="submissions-count">{task.submissions_status}</span>
            {task.pending_evaluation > 0 ? (
                <span className="badge pending">
                    {task.pending_evaluation} PARA PONTUAR
                </span>
            ) : (
                <span className="badge evaluated">Avaliado</span>
            )}
          </div>
          
          <button className="action-button">Revisar e Pontuar</button>
        </div>
      ))}

      <button className="view-archive-button">Ver Arquivo de Tarefas Concluídas</button>
    </div>
  );
};

export default TaskList;