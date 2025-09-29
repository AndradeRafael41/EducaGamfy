import React from 'react';
import TaskList from '@/components/teacher/TaskList'; // Para listagem de tarefas cadastradas
import CreateTaskForm from '@/components/teacher/CreateTaskForm';

const TeacherDashboard = ({ teacherName = "Professora Carla" }) => {
  
  // Mocks de dados baseados nas tabelas students, tasks e teachers
  const totalStudents = 28;
  const pendingSubmissions = 7;
  
  return (
    <div className="teacher-dashboard-container">
      <header>
        <h2>Bem-vindo(a) ao EducaGamify, {teacherName}</h2>
        <p>Acesse o gerenciamento de tarefas e acompanhe o progresso do seu 5º ano.</p>
      </header>

      <div className="grid-layout">
        
        {/* Bloco 1: Cadastro Rápido de Tarefas [5] */}
        <section className="card task-creation">
          <h3>+ Cadastro Rápido de Atividade</h3>
          <p>Defina título, pontos máximos e prazo de entrega (tabela 'tasks').</p>
          <CreateTaskForm /> {/* Componente para entrada rápida de dados */}
        </section>

        {/* Bloco 2: Listagem de Tarefas Cadastradas e Avaliação (Detalhado abaixo) */}
        <section className="card task-list-section">
          <TaskList /> 
          <p className="summary">Você tem **{pendingSubmissions}** submissões aguardando pontuação.</p>
        </section>

        {/* Bloco 3: Gestão de Recompensas [13, 17] */}
        <section className="card rewards-management">
          <h3>Loja de Recompensas</h3>
          <p>Gerencie os itens resgatáveis (tabela 'rewards'): Dia do Brinquedo, Jogar Bola na Quadra, etc.</p>
          <button className="manage-rewards-button">Gerenciar Recompensas ({totalStudents} Alunos)</button>
        </section>

        {/* Bloco 4: Relatórios e Feedback [5, 18] */}
        <section className="card reports-summary">
          <h3>Visão Geral da Turma</h3>
          <ul>
            <li>**Alunos no Nível 3:** 18/28 alunos (foco na progressão) [14]</li>
            <li>**Próxima Etapa:** Implementação de medalhas e evolução de personagem [19, 20]</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
