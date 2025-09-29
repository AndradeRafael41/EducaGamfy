import React, { useState } from 'react';
// import { signIn } from 'next-auth/react'; // Importação real do NextAuth
// import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const router = useRouter(); 

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Simulação da chamada ao NextAuth.js
    // const result = await signIn('credentials', { 
    //   email, 
    //   password, 
    //   redirect: false 
    // });
    
    // Após a autenticação, a função de callback do NextAuth leria o campo 'role' (TEACHER/STUDENT) [7]
    // para determinar o redirecionamento.
    
    // Exemplo de lógica de redirecionamento (simulada):
    // if (result.ok) {
    //   // Supondo que o professor use o email para logar e tenha a role TEACHER [conversation history]
    //   if (email.includes("@professor.com")) { 
    //     router.push('/teacher/dashboard');
    //   } else {
    //     router.push('/student/dashboard'); 
    //   }
    // }
    console.log("Tentativa de Login efetuada. Verificando credenciais e role...");
  };

  return (
    <div className="login-screen">
      <h1>EducaGamify</h1>
      <p>Acesse a plataforma de gestão gamificada para professores.</p>
      
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email de Professor/Aluno"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
          />
        </div>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default LoginForm;