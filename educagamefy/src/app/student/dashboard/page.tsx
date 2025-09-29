import React from 'react';
import ProgressLevel from '@/components/student/ProgressLevel';
import BadgesList from '@/components/student/BadgesList';
import RewardsStore from '@/components/student/RewardsStore';

const StudentDashboard = ({ studentName = "Aluno João", currentLevel = 3 }) => {
  // Dados simulados baseados na progressão do aluno [14]
  const studentData = {
    totalPoints: 1250, 
    level: currentLevel, // default level 1 [14]
    progressToNextLevel: 75, // Corresponde a 'level_progress' [14]
    medalsEarned: ['Super Foco', 'Leitor Master', 'Colaborador'], // Corresponde a 'student_badges' [19]
  };

  return (
    <div className="student-dashboard">
      <header className="gamified-header">
        <h1>Olá, {studentName}!</h1>
        <h2>Seu Universo de Conquistas</h2>
      </header>

      <div className="progress-bar-area">
        <ProgressLevel 
          level={studentData.level} 
          progress={studentData.progressToNextLevel} 
        />
        <div className="points-display">
          <h3>⭐ {studentData.totalPoints} Pontos</h3>
          <p>Continue assim para subir de nível!</p>
        </div>
        {/* Representação visual da evolução do personagem ou níveis [17] */}
      </div>

      <div className="grid-layout">
        
        {/* Bloco 1: Minhas Conquistas (Medalhas/Estrelas) */}
        <section className="card achievements">
          <h3>🏆 Minhas Medalhas</h3>
          <p>Seu histórico de conquistas visíveis [6].</p>
          <BadgesList badges={studentData.medalsEarned} /> {/* Exibição de 'student_badges' [19] */}
        </section>

        {/* Bloco 2: Resgate de Recompensas */}
        <section className="card rewards-store">
          <h3>🛒 Loja de Recompensas</h3>
          <p>Use seus pontos para resgatar atividades [4].</p>
          <RewardsStore currentPoints={studentData.totalPoints} /> {/* Permite interagir com 'rewards' [16] */}
          <button>Resgatar!</button>
        </section>
        
        {/* Bloco 3: Tarefas Ativas/Recentes */}
        <section className="card active-tasks">
          <h3>Próximas Tarefas</h3>
          <ul>
            <li>Matemática: Desafio da Multiplicação (+40 Pontos)</li>
            <li>Português: Pesquisa Histórica (+75 Pontos)</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;