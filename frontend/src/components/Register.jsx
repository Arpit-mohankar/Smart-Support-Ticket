import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';

export default function Register() {
  const [name,  setName] =  useState('');
  const [email, setEmail] =  useState('');
  const  [password, setPassword] = useState ('');
  const [error,  setError] = useState ('');
  const   [success,   setSuccess] = useState ('');
   const navigate = useNavigate();

  const Handle = async  (p) => {
    p.preventDefault();
     setError('');
    setSuccess('');

    try {
      await auth.register({ name, email, password });
      setSuccess('Registration successful! Redirecting to login..');
       setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error ||   'Registration failed');
    }
  };

  return (
    <div className="min-h-screen    flex items-center  justify-center bg-gray-100">
       <div className="bg-white  p-8 rounded shadow-md w-96">

         <h2 className="text-2xl  font-bold mb-6">Create Account</h2>
        
        {error && (

          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
             {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100   text-green-700   p-3 rounded mb-4">
             {success}
          </div>
        )}

        <form onSubmit={Handle} >
          <div className="mb-4">
             <label className="block  text-gray-700 mb-2">Name</label>
             <input
              type="text"
              placeholder="Enter your name"
              className="w-full p-2 border rounded"

              value={name}
                 onChange={(t) => setName(t.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700  mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
               className="w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
               required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
               type="password"
              placeholder="Enter your password"
              className="w-full p-2 border rounded"
               value={password}
              onChange={(p) => setPassword(p.target.value)}
              required
               minLength="6"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters
            </p>

          </div>

          <button
            type="submit"
            className="w-full   bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >

            Register
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">

          Already have an account?{' '}

          <Link to="/login" className="text-blue-500 hover:underline">

            Login here

          </Link>
        </p>
      </div>
    </div>
  );
}
